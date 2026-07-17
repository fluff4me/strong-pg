import { describe, expect, test, vi } from 'vitest'
import sql from '../src/sql'

describe('sql templates', () => {
	test('parameterizes interpolated values', () => {
		const query = sql`SELECT * FROM accounts WHERE email = ${'reader@example.test'} AND profile = ${{ role: 'reader' }}`

		expect(query.text).toBe('SELECT * FROM accounts WHERE email = $1 AND profile = $2')
		expect(query.values).toEqual(['reader@example.test', { role: 'reader' }])
	})

	test('flattens nested templates and preserves placeholder order', () => {
		const predicate = sql`email = ${'one@example.test'} OR email = ${'two@example.test'}`
		const query = sql`SELECT * FROM accounts WHERE (${predicate}) AND state = ${'Active'}`

		expect(query.text).toBe('SELECT * FROM accounts WHERE (email = $1 OR email = $2) AND state = $3')
		expect(query.values).toEqual(['one@example.test', 'two@example.test', 'Active'])
	})

	test('compiles nested templates into an existing variable array', () => {
		const vars = ['existing']
		const query = sql`email = ${'reader@example.test'} AND state = ${'Active'}`

		expect(query.compile(vars)).toBe('email = $2 AND state = $3')
		expect(vars).toEqual(['existing', 'reader@example.test', 'Active'])
	})

	test('joins SQL fragments without parameterizing the separator', () => {
		const query = sql`SELECT * FROM accounts WHERE ${sql.join([
			sql`email = ${'one@example.test'}`,
			sql`email = ${'two@example.test'}`,
		], sql` OR `)}`

		expect(query.text).toBe('SELECT * FROM accounts WHERE email = $1 OR email = $2')
		expect(query.values).toEqual(['one@example.test', 'two@example.test'])
	})

		test('keeps static and explicitly raw text free of values', () => {
			expect(sql`SELECT 1`).toMatchObject({ text: 'SELECT 1', values: undefined })
			expect(sql`SELECT ${sql.raw('CURRENT_TIMESTAMP')}`).toMatchObject({
				text: 'SELECT CURRENT_TIMESTAMP',
				values: [],
			})
		expect(sql.is(sql``)).toBe(true)
		expect(sql.is({ text: '' })).toBe(false)
	})

	test('submits the query config to a pool', async () => {
		const pool = { query: vi.fn(async () => ({ rows: [{ value: 1 }] })) }
		const query = sql`SELECT ${'value'}`

		await expect(query.query(pool as never)).resolves.toEqual({ rows: [{ value: 1 }] })
		expect(pool.query).toHaveBeenCalledWith(query)
	})

	test('attaches compiled SQL to database-shaped errors', async () => {
		const error = Object.assign(new Error('syntax error'), { internalQuery: '' })
		const pool = { query: vi.fn(async () => { throw error }) }

		await expect(sql`SELECT ${'value'}`.query(pool as never)).rejects.toBe(error)
		expect(error.internalQuery).toBe('SELECT $1')
	})
})
