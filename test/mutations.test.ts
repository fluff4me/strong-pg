import { describe, expect, expectTypeOf, test } from 'vitest'
import { DataType } from '../src/IStrongPG'
import { compile, database, mockClient, normalizeSql, queryResult } from './fixtures'

describe('insert query builders', () => {
	test('builds single and bulk inserts with stable placeholders', () => {
		const insert = database.table('posts').insert('author_id', 'title', 'body', 'published')
			.values('1', "First's title", 'Body one', true)
			.values('2', 'Second title', 'Body two', false)
		const query = compile(insert)[0]

		expect(normalizeSql(query.text)).toBe('INSERT INTO posts (author_id,title,body,published) VALUES ($1,$2,$3,TRUE),($4,$5,$6,FALSE)')
		expect(query.values).toEqual(['1', "First's title", 'Body one', '2', 'Second title', 'Body two'])
	})

	test('builds object inserts and omits undefined optional values', () => {
		const insert = database.table('accounts').insert({
			email: 'reader@example.test',
			display_name: undefined,
			state: 'Active',
			created_at: 0,
			profile: { role: 'reader' },
		})
		const query = compile(insert)[0]

		expect(query.text).not.toContain('display_name')
		expect(normalizeSql(query.text)).toContain('INSERT INTO accounts (email,state,created_at,profile)')
		expect(query.values).toEqual(['reader@example.test', 'Active', { role: 'reader' }])
		expect(query.text).toContain("'1970-01-01T00:00:00.000Z'")
	})

	test('builds conflict actions and returning clauses', () => {
		const nothing = database.table('accounts').insert('email', 'state', 'created_at', 'profile')
			.values('reader@example.test', 'Active', new Date(0), {})
			.onConflict('email').doNothing()
			.returning('id', 'email')
		const update = database.table('accounts').insert('id', 'email', 'state', 'created_at', 'profile')
			.values('1', 'reader@example.test', 'Active', new Date(0), {})
			.onConflict('id').doUpdate(set => set.set('email', e => e.var('EXCLUDED.email')))

		expect(normalizeSql(compile(nothing)[0].text)).toContain('ON CONFLICT (email) DO NOTHING RETURNING id,email')
		expect(normalizeSql(compile(update)[0].text)).toContain('ON CONFLICT (id) DO UPDATE SET email=(EXCLUDED.email)')
		expectTypeOf(nothing.query).returns.toEqualTypeOf<Promise<{ id: `${bigint}`, email: string }[]>>()
	})

	test('builds primary-key upserts', () => {
		const upsert = database.table('accounts').upsert({
			id: '1',
			email: 'reader@example.test',
			state: 'Active',
			created_at: new Date(0),
			profile: {},
		})
		const text = normalizeSql(compile(upsert)[0].text)

		expect(text).toContain('ON CONFLICT (id) DO UPDATE SET')
		expect(text).toContain('email=(EXCLUDED.email)')
	})

	test('returns inserted rows from query execution', async () => {
		const client = mockClient([queryResult([{ id: '1', email: 'reader@example.test' }])])
		const rows = await database.table('accounts')
			.insert({ email: 'reader@example.test', state: 'Active', created_at: new Date(0), profile: {} })
			.returning('id', 'email')
			.query(client)

		expect(rows).toEqual([{ id: '1', email: 'reader@example.test' }])
	})
})

describe('update, delete, and truncate query builders', () => {
	test('builds updates from objects and expression assignments', () => {
		const update = database.table('accounts').update({ display_name: "Reader's name" })
			.set('state', 'Disabled')
			.set('created_at', 0)
			.where(e => e.var('email').equals('reader@example.test'))
			.returning('id', 'state')
		const query = compile(update)[0]

		expect(normalizeSql(query.text)).toContain('UPDATE accounts SET display_name=$1,state=$2,created_at=')
		expect(normalizeSql(query.text)).toContain('WHERE (email = $3) RETURNING id,state')
		expect(query.values).toEqual(["Reader's name", 'Disabled', 'reader@example.test'])
		expectTypeOf(update.query).returns.toEqualTypeOf<Promise<{ id: `${bigint}`, state: string }[]>>()
	})

	test('builds updates from typed VALUES tables', () => {
		const update = database.table('accounts').update()
			.from('incoming', ['id', 'name'], values => values
				.types(DataType.BIGINT, DataType.TEXT)
				.values(['1', "Reader's name"], ['2', 'Second']))
			.set('display_name', e => e.var('incoming.name'))
			.where(e => e.var('accounts.id').equals(e.var('incoming.id')))
		const query = compile(update)[0]

		expect(normalizeSql(query.text)).toContain('FROM (VALUES ($1::BIGINT,$2::TEXT),($3,$4)) AS incoming (id,name)')
		expect(query.values).toEqual(['1', "Reader's name", '2', 'Second'])
	})

	test('maps update row counts unless returning rows', async () => {
		const countClient = mockClient([queryResult([], 3)])
		const rowsClient = mockClient([queryResult([{ id: '1' }])])
		const countUpdate = database.table('accounts').update({ state: 'Disabled' })
		const returningUpdate = database.table('accounts').update({ state: 'Disabled' }).returning('id')

		expectTypeOf(countUpdate.query).returns.toEqualTypeOf<Promise<number>>()
		expectTypeOf(returningUpdate.query).returns.toEqualTypeOf<Promise<{ id: `${bigint}` }[]>>()
		await expect(countUpdate.query(countClient)).resolves.toBe(3)
		await expect(returningUpdate.query(rowsClient))
			.resolves.toEqual([{ id: '1' }])
	})

	test('builds primary-keyed deletes and returns deleted rows', async () => {
		const statement = database.table('accounts').delete()
			.primaryKeyed('1')
			.returning('id', 'email')
		const query = compile(statement)[0]
		const client = mockClient([queryResult([{ id: '1', email: 'reader@example.test' }])])

		expect(normalizeSql(query.text)).toBe('DELETE FROM accounts WHERE (id = $1) RETURNING id,email')
		expect(query.values).toEqual(['1'])
		await expect(statement.query(client)).resolves.toEqual([{ id: '1', email: 'reader@example.test' }])
	})

	test('builds truncate with optional cascade', () => {
		expect(normalizeSql(compile(database.table('posts').truncate())[0].text)).toBe('TRUNCATE posts')
		expect(normalizeSql(compile(database.table('posts').truncate().cascade())[0].text)).toBe('TRUNCATE posts CASCADE')
	})
})
