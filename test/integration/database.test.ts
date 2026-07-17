import { Pool } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import Database from '../../src/Database'
import { DataType } from '../../src/IStrongPG'
import Migration from '../../src/Migration'
import Schema from '../../src/Schema'
import Transaction from '../../src/Transaction'
import { SQL_INJECTION_PAYLOADS } from '../fixtures'

const connectionString = process.env.TEST_DATABASE_URL
const integration = connectionString ? describe : describe.skip

const RECORDS = Schema.table({
	id: DataType.BIGSERIAL,
	PRIMARY_KEY: Schema.primaryKey('id'),
	record_key: DataType.TEXT,
	body: DataType.TEXT,
	metadata: DataType.JSONB,
})

const AUDITS = Schema.table({
	id: DataType.BIGSERIAL,
	PRIMARY_KEY: Schema.primaryKey('id'),
	record_id: DataType.BIGINT,
	message: DataType.TEXT,
})

const INTEGRATION_SCHEMA = Schema.database({ tables: { records: RECORDS, audits: AUDITS } })
const database = new Database(INTEGRATION_SCHEMA)

integration('PostgreSQL integration', () => {
	let pool: Pool
	async function resetDatabase () {
		await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public')
		await pool.query(`CREATE TABLE records (
			id BIGSERIAL PRIMARY KEY,
			record_key TEXT UNIQUE NOT NULL,
			body TEXT NOT NULL,
			metadata JSONB NOT NULL
		)`)
		await pool.query(`CREATE TABLE audits (
			id BIGSERIAL PRIMARY KEY,
			record_id BIGINT NOT NULL REFERENCES records(id),
			message TEXT NOT NULL
		)`)
	}

	beforeAll(async () => {
		const url = new URL(connectionString!)
		if (decodeURIComponent(url.pathname.slice(1)) !== 'strong_pg_test')
			throw new Error('Integration tests require a database named exactly strong_pg_test')
		if (process.env.STRONG_PG_TEST_DATABASE_RESET !== '1')
			throw new Error('Integration tests require STRONG_PG_TEST_DATABASE_RESET=1 before resetting the database')

		pool = new Pool({ connectionString, max: 1 })
	})

	beforeEach(async () => {
		await resetDatabase()
	})

	afterAll(async () => {
		await pool?.end()
	})

	test('executes CRUD and returning behavior against PostgreSQL', async () => {
		const [inserted] = await database.table('records').insert({
			record_key: 'first',
			body: "Reader's record",
			metadata: { active: true },
		}).returning('*').query(pool)

		expect(inserted).toMatchObject({ record_key: 'first', body: "Reader's record", metadata: { active: true } })

		const selected = await database.table('records').select('*').primaryKeyed(inserted.id).query(pool)
		expect(selected).toMatchObject({ id: inserted.id, record_key: 'first' })

		const [updated] = await database.table('records').update({ body: 'Updated' })
			.primaryKeyed(inserted.id)
			.returning('*')
			.query(pool)
		expect(updated.body).toBe('Updated')

		const [removed] = await database.table('records').delete().primaryKeyed(inserted.id).returning('*').query(pool)
		expect(removed.id).toBe(inserted.id)
	})

	test('executes conflict updates and joins', async () => {
		const [record] = await database.table('records').insert({ record_key: 'conflict', body: 'one', metadata: {} }).returning('*').query(pool)
		await database.table('records').insert('record_key', 'body', 'metadata')
			.values('conflict', 'two', { version: 2 })
			.onConflict('record_key').doUpdate(update => update
				.set('body', e => e.var('EXCLUDED.body'))
				.set('metadata', e => e.var('EXCLUDED.metadata')))
			.query(pool)
		await database.table('audits').insert({ record_id: record.id, message: 'changed' }).query(pool)

		const rows = await database.table('records').as('r').innerJoin('audits', 'a')
			.on(e => e.var('r.id').equals(e.var('a.record_id')))
			.select('r.body', 'a.message')
			.where(e => e.var('r.record_key').equals('conflict'))
			.query(pool)

		expect(rows).toEqual([{ body: 'two', message: 'changed' }])
	})

	test('rolls back failed transaction work', async () => {
		await expect(Transaction.execute(pool, async client => {
			await database.table('records').insert({ record_key: 'rolled-back', body: 'temporary', metadata: {} }).query(client)
			throw new Error('force rollback')
		})).rejects.toThrow('force rollback')

		await expect(database.table('records').select('*')
			.where(e => e.var('record_key').equals('rolled-back'))
			.queryOne(pool)).resolves.toBeUndefined()
	})

	test('round-trips injection payloads without executing them', async () => {
		for (const [index, payload] of SQL_INJECTION_PAYLOADS.entries()) {
			const [row] = await database.table('records').insert({
				record_key: `payload-${index}`,
				body: payload,
				metadata: { payload },
			}).returning('*').query(pool)
			expect(row.body).toBe(payload)
			expect(row.metadata).toEqual({ payload })
		}

		const relation = await pool.query<{ relation: string | null }>("SELECT to_regclass('public.records') relation")
		expect(relation.rows[0].relation).toBe('records')
		expect(await database.table('records').select('*').query(pool)).toHaveLength(SQL_INJECTION_PAYLOADS.length)
	})

	test('executes a representative migration and records its history', async () => {
		const migratedSchema = Schema.database({
			tables: {
				migrated_items: Schema.table({
					id: DataType.BIGSERIAL,
					PRIMARY_KEY: Schema.primaryKey('id'),
					label: DataType.TEXT,
				}),
			},
		})
		const migration = new Migration()
			.createTable('migrated_items', table => table
				.addColumn('id', DataType.BIGSERIAL, column => column.notNull())
				.addPrimaryKey('id')
				.addColumn('label', DataType.TEXT, column => column.notNull()))
			.schema(migratedSchema)
		const migrated = new Database(migratedSchema).setHistory(history => history.migration(migration))

		await expect(migrated.migrate(pool)).resolves.toBe(0)
		const relation = await pool.query<{ relation: string | null }>("SELECT to_regclass('public.migrated_items') relation")
		const history = await pool.query<{ migration_index_end: number }>('SELECT migration_index_end FROM migrations')
		expect(relation.rows[0].relation).toBe('migrated_items')
		expect(history.rows).toEqual([{ migration_index_end: 0 }])
	})
})
