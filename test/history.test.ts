import type { PoolClient } from 'pg'
import { describe, expect, test, vi } from 'vitest'
import Database from '../src/Database'
import { History } from '../src/History'
import { DataType } from '../src/IStrongPG'
import Migration from '../src/Migration'
import Schema from '../src/Schema'
import { queryResult } from './fixtures'

function historyClient (lastApplied?: number) {
	return {
		query: vi.fn(async (query: any) => {
			const text = typeof query === 'string' ? query : query.text
			if (text.startsWith('SELECT migration_index_end'))
				return lastApplied === undefined ? queryResult() : queryResult([{ migration_index_end: lastApplied }])
			return queryResult()
		}),
		release: vi.fn(),
	} as unknown as PoolClient
}

function migration () {
	const schema = Schema.database({ tables: { things: Schema.table({ id: DataType.BIGSERIAL, PRIMARY_KEY: Schema.primaryKey('id') }) } })
	return {
		database: new Database(schema),
		migration: new Migration()
			.createTable('things', table => table.addColumn('id', DataType.BIGSERIAL, column => column.notNull()).addPrimaryKey('id'))
			.schema(schema),
	}
}

describe('History', () => {
	test('initializes migration storage and returns -1 for an empty history', async () => {
		const client = historyClient()
		const database = new Database(Schema.database({}))

		await expect(new History().migrate(database as never, client)).resolves.toBe(-1)
		expect(client.query).toHaveBeenCalledTimes(2)
		expect(client.query).toHaveBeenNthCalledWith(1, expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'))
	})

	test('applies fresh commits and records the applied range', async () => {
		const client = historyClient()
		const setup = migration()
		const history = new History().migration(setup.migration)

		await expect(history.migrate(setup.database as never, client)).resolves.toBe(0)
		expect(client.query).toHaveBeenCalledWith(expect.objectContaining({ text: 'CREATE TABLE things ()' }))
		expect(client.query).toHaveBeenCalledWith('INSERT INTO migrations VALUES ($1, $2)', [-1, 0])
		expect(history.rolledBack).toBe(false)
	})

	test('does not rerun commits already recorded as current', async () => {
		const client = historyClient(0)
		const setup = migration()
		const history = new History().migration(setup.migration)

		await expect(history.migrate(setup.database as never, client)).resolves.toBe(0)
		expect(client.query).toHaveBeenCalledTimes(2)
		expect(history.rolledBack).toBeUndefined()
	})

	test('flattens migration groups while preserving order', () => {
		const first = migration().migration
		const second = migration().migration
		const grouped = new History()
			.group(history => history.migration(first))
			.group(history => history.migration(second as never))

		expect(grouped).toBeInstanceOf(History)
	})
})
