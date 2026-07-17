import { describe, expect, test, vi } from 'vitest'
import Transaction from '../src/Transaction'
import Statement from '../src/statements/Statement'
import { mockClient, mockPool, queryResult } from './fixtures'

describe('Transaction.execute', () => {
	test('owns begin, commit, release, and executor output for pools', async () => {
		const { client, pool } = mockPool()
		const result = await Transaction.execute(pool, async transactionClient => {
			expect(transactionClient).toBe(client)
			await transactionClient.query('SELECT 1')
			return 42
		})

		expect(result).toBe(42)
		expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN')
		expect(client.query).toHaveBeenNthCalledWith(2, 'SELECT 1')
		expect(client.query).toHaveBeenNthCalledWith(3, 'COMMIT')
		expect(client.release).toHaveBeenCalledOnce()
	})

	test('rolls back, rethrows, and releases when an executor fails', async () => {
		const error = new Error('executor failed')
		const { client, pool } = mockPool()

		await expect(Transaction.execute(pool, async () => { throw error })).rejects.toBe(error)
		expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN')
		expect(client.query).toHaveBeenNthCalledWith(2, 'ROLLBACK')
		expect(client.release).toHaveBeenCalledOnce()
	})

	test('reuses existing clients without nesting transaction commands', async () => {
		const client = mockClient()
		const handleError = vi.fn()
		const error = new Error('nested failure')

		await expect(Transaction.execute(client, async () => { throw error }, handleError)).rejects.toBe(error)
		expect(client.query).not.toHaveBeenCalled()
		expect(client.release).not.toHaveBeenCalled()
		expect(handleError).toHaveBeenCalledWith(error, client)
	})

	test('turns asynchronously signalled statement errors into rollbacks', async () => {
		const error = new Error('async client error')
		const handleError = vi.fn()
		const { client, pool } = mockPool()

		await expect(Transaction.execute(pool, async transactionClient => {
			queueMicrotask(() => (transactionClient as any).throwError(error))
			await new Promise(resolve => setTimeout(resolve, 5))
			return 'too late'
		}, handleError)).rejects.toBe(error)
		expect(handleError).toHaveBeenCalledWith(error, client)
		expect(client.query).toHaveBeenCalledWith('ROLLBACK')
	})
})

describe('Transaction and Statement execution', () => {
	test('compiles eager and lazy statements in insertion order', () => {
		const transaction = new Transaction()
			.add(new Statement.Basic('SELECT 1'))
			.add(() => new Statement.Basic(['SELECT 2', 'SELECT 3']))

		expect(transaction.compile().map(query => query.text)).toEqual(['SELECT 1', 'SELECT 2', 'SELECT 3'])
	})

	test('executes transaction statements sequentially', async () => {
		const { client, pool } = mockPool()
		const transaction = new Transaction()
			.add(new Statement.Basic('SELECT 1'))
			.add(new Statement.Basic('SELECT 2'))

		await transaction.execute(pool)
		expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN')
		expect(client.query).toHaveBeenNthCalledWith(2, expect.objectContaining({ text: 'SELECT 1' }))
		expect(client.query).toHaveBeenNthCalledWith(3, expect.objectContaining({ text: 'SELECT 2' }))
		expect(client.query).toHaveBeenNthCalledWith(4, 'COMMIT')
	})

	test('returns the final statement result through statement query resolution', async () => {
		class CountStatement extends Statement<number> {
			public compile () { return this.queryable(['UPDATE one', 'UPDATE two']) }
			protected override resolveQueryOutput (output: any) { return output.rowCount as number }
		}
		const client = mockClient([queryResult([], 1), queryResult([], 7)])

		await expect(new CountStatement().query(client)).resolves.toBe(7)
	})
})
