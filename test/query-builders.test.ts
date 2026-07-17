import { describe, expect, expectTypeOf, test } from 'vitest'
import { ASC, BREADTH, DESC } from '../src/IStrongPG'
import { compile, database, mockClient, normalizeSql, queryResult } from './fixtures'

describe('select query builders', () => {
	test('selects stars, columns, and aliased expressions', () => {
		const star = database.table('accounts').select('*')
		const columns = database.table('accounts').select('id', 'email')
		const aliases = database.table('accounts').select({
			account_id: 'id',
			name: 'display_name',
			normalized_email: e => e.lowercase(e.var('email')),
		})

		expect(normalizeSql(compile(star)[0].text)).toBe('SELECT * FROM accounts')
		expect(normalizeSql(compile(columns)[0].text)).toBe('SELECT id,email FROM accounts')
		expect(normalizeSql(compile(aliases)[0].text)).toBe('SELECT id account_id,display_name name,lower((email)) normalized_email FROM accounts')
		expectTypeOf(columns.query).returns.toEqualTypeOf<Promise<{ id: `${bigint}`, email: string }[]>>()
		expectTypeOf(columns.queryOne).returns.toEqualTypeOf<Promise<{ id: `${bigint}`, email: string } | undefined>>()
	})

	test('combines predicates, ordering, pagination, and primary-key lookup', () => {
		const paged = database.table('accounts')
			.select('id', 'email')
			.where(e => e.var('state').equals('Active'))
			.orderBy([['display_name', ASC], [null, 'created_at', DESC]])
			.offset(10)
			.limit(5)
		const primaryKeyed = database.table('accounts').select('*').primaryKeyed('42')

		expect(normalizeSql(compile(paged)[0].text))
			.toBe('SELECT id,email FROM accounts WHERE (state = $1) ORDER BY display_name ASC,created_at IS NULL DESC OFFSET 10 LIMIT 5')
		expect(compile(paged)[0].values).toEqual(['Active'])
		expect(normalizeSql(compile(primaryKeyed)[0].text)).toContain('WHERE (id = $1)')
		expect(compile(primaryKeyed)[0].values).toEqual(['42'])
	})

	test('builds cross, inner, and outer joins', () => {
		const cross = (database.table('accounts').innerJoin('posts') as any).select('accounts.id', 'posts.title')
		const innerJoin = database.table('accounts').as('a').innerJoin('posts', 'p')
			.on(e => e.var('a.id').equals(e.var('p.author_id')))
		const inner = (innerJoin as any).select('a.email', 'p.title')
		const outerJoin = database.table('accounts').leftOuterJoin('posts')
			.on(e => e.var('accounts.id').equals(e.var('posts.author_id')))
		const outer = (outerJoin as any).select('*')

		expect(normalizeSql(compile(cross)[0].text)).toContain('FROM accounts CROSS JOIN posts')
		expect(normalizeSql(compile(inner)[0].text)).toContain('FROM accounts a INNER JOIN posts p ON (a.id = (p.author_id))')
		expect(normalizeSql(compile(outer)[0].text)).toContain('LEFT OUTER JOIN posts ON (accounts.id = (posts.author_id))')
	})

	test('requires ON conditions for outer joins but permits cross joins', () => {
		expect(() => (database.table('accounts').leftOuterJoin('posts') as any).select('*').compile())
			.toThrow('no ON expression provided')
		expect(() => (database.table('accounts').innerJoin('posts') as any).select('*').compile()).not.toThrow()
	})

	test('builds recursive CTEs and applies search ordering', () => {
		const recursive = database.table('posts').recursive(['id', 'author_id'], query => query
			.where(e => e.var('id').equals('1'))
			.thenWhere(e => e.var('author_id').equals(e.var('current.id')))
			.searchBy(BREADTH, 'id')
			.orderBy('author_id', DESC))
		const select = (recursive as any).select('*')
		const query = compile(select)[0]

		expect(normalizeSql(query.text)).toContain('WITH RECURSIVE vt_recursive_posts(id,author_id) AS')
		expect(normalizeSql(query.text)).toContain('SEARCH BREADTH FIRST BY id SET with_recursive_search_order')
		expect(normalizeSql(query.text)).toContain('ORDER BY with_recursive_search_order ,author_id DESC')
		expect(query.values).toEqual(['1'])
	})

	test('requires a recursive condition', () => {
		const recursive = database.table('posts').recursive(['id'], query => query.where(e => e.var('id').equals('1')))
		expect(() => (recursive as any).select('*').compile()).toThrow('A recursive condition is required')
	})

	test('selects from and performs typed database functions', () => {
		const call = database.function('find_account', "reader's@example.test")
		const select = call.select('id', 'email')
		const perform = call.perform()

		expect(normalizeSql(compile(select)[0].text)).toBe('SELECT id,email FROM find_account($1)')
		expect(compile(select)[0].values).toEqual(["reader's@example.test"])
		expect(compile(perform)[0]).toMatchObject({ text: 'SELECT find_account($1)', values: ["reader's@example.test"] })
	})

	test('maps queryOne to the first returned row', async () => {
		const client = mockClient([queryResult([{ id: '1', email: 'one@example.test' }])])
		const result = await database.table('accounts').select('id', 'email').queryOne(client)

		expect(result).toEqual({ id: '1', email: 'one@example.test' })
		expect(client.query).toHaveBeenCalledTimes(1)
	})
})
