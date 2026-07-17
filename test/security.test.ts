import { describe, expect, test } from 'vitest'
import Expression from '../src/expressions/Expression'
import { DataType } from '../src/IStrongPG'
import sql from '../src/sql'
import CreateCollation from '../src/statements/collation/CreateCollation'
import AlterEnum from '../src/statements/enum/AlterEnum'
import AlterTable, { AlterColumn } from '../src/statements/table/AlterTable'
import { SQL_INJECTION_PAYLOADS, compile, database } from './fixtures'

describe('SQL injection protections', () => {
	for (const payload of SQL_INJECTION_PAYLOADS) {
		test(`parameterizes direct and nested SQL values: ${payload}`, () => {
			const nested = sql`email = ${payload}`
			const query = sql`SELECT * FROM accounts WHERE ${nested} OR display_name = ${payload}`

			expect(query.text).not.toContain(payload)
			expect(query.values).toEqual([payload, payload])
		})

		test(`parameterizes select, insert, update, and delete values: ${payload}`, () => {
			const select = compile(database.table('accounts').select('*').where(e => e.var('email').equals(payload)))[0]
			const insert = compile(database.table('posts').insert({
				author_id: '1',
				title: payload,
				body: payload,
				published: false,
			}))[0]
			const update = compile(database.table('accounts').update({ display_name: payload }).where(e => e.var('email').equals(payload)))[0]
			const remove = compile(database.table('accounts').delete().where(e => e.var('email').equals(payload)))[0]

			for (const query of [select, insert, update, remove])
				expect(query.text).not.toContain(payload)
			expect(select.values).toContain(payload)
			expect(insert.values).toEqual(['1', payload])
			expect(update.values).toEqual([payload])
			expect(remove.values).toEqual([payload])
		})

		test(`parameterizes JSON, conflicts, functions, and nested EXISTS values: ${payload}`, () => {
			const json = compile(database.table('accounts').insert({
				email: payload,
				state: 'Active',
				created_at: new Date(0),
				profile: { payload },
			}).onConflict('email').doUpdate(update => update.set('display_name', payload)))[0]
			const fn = compile(database.function('find_account', payload).perform())[0]
			const exists = Expression.compile((e: any) => e.exists(database, 'accounts', (select: any) => select
				.where((inner: any) => inner.var('email').equals(payload))))

			for (const query of [json, fn, exists])
				expect(query.text).not.toContain(payload)
			expect(json.values).toEqual([payload, 'Active', { payload }])
			expect(fn.values).toEqual([payload])
			expect(exists.values).toEqual([payload])
		})

		test(`parameterizes bulk VALUES and recursive predicate values: ${payload}`, () => {
			const update = compile(database.table('accounts').update()
				.from('incoming', ['id', 'name'], values => values
					.types(DataType.BIGINT, DataType.TEXT)
					.values(['1', payload]))
				.set('display_name', e => e.var('incoming.name'))
				.where(e => e.var('accounts.id').equals(e.var('incoming.id'))))[0]
			const recursive = database.table('posts').recursive(['id'], query => query
				.where(e => e.var('title').equals(payload))
				.thenWhere(e => e.var('id').equals(e.var('current.id'))))
			const recursiveQuery = compile((recursive as any).select('*'))[0]

			expect(update.text).not.toContain(payload)
			expect(update.values).toEqual(['1', payload])
			expect(recursiveQuery.text).not.toContain(payload)
			expect(recursiveQuery.values).toEqual([payload])
		})
	}

	test('keeps raw SQL as an explicit, visible trust-boundary bypass', () => {
		const payload = SQL_INJECTION_PAYLOADS[0]
		const query = sql`SELECT ${sql.raw(payload)}`

		expect(query.text).toContain(payload)
		expect(query.values).toEqual([])
	})
})

describe('known security gaps', () => {
	const payload = SQL_INJECTION_PAYLOADS[0]

	for (const [operation, compileSequence] of [
		['nextValue', () => Expression.compile((e: any) => e.nextValue(payload))],
		['currentValue', () => Expression.compile((e: any) => e.currentValue(payload))],
	] as const) {
		test.fails(`parameterizes sequence names passed to ${operation}`, () => {
			const query = compileSequence()

			expect(query.text).not.toContain(payload)
			expect(query.values).toContain(payload)
		})
	}

	test.fails('rejects runtime-cast SQL text passed as a limit', () => {
		expect(() => database.table('accounts').select('*').limit(payload as never).compile())
			.toThrow('Unsafe value for limit')
	})

	for (const operation of ['limit', 'offset'] as const) {
		for (const [name, value] of [
			['NaN', NaN],
			['Infinity', Infinity],
			['negative', -1],
			['fractional', 1.5],
		] as const) {
			test.fails(`rejects ${name} values passed to ${operation}`, () => {
				expect(() => database.table('accounts').select('*')[operation](value).compile()).toThrow()
			})
		}
	}

	const literalCases: readonly [name: string, statement: () => AlterTable<any> | AlterColumn<any, any> | AlterEnum<any> | CreateCollation][] = [
		['create-column default literals', () => new AlterTable<any>('accounts')
			.addColumn('label', DataType.TEXT, column => column.default(payload))],
		['alter-column default literals', () => new AlterColumn<'label', typeof DataType.TEXT>('label').setDefault(payload)],
		['enum values added with add', () => new AlterEnum<[]>('unsafe_enum').add(payload)],
		['new enum values added with addBefore', () => new AlterEnum<['safe']>('unsafe_enum').addBefore(payload, 'safe')],
		['enum pivots passed to addBefore', () => new AlterEnum<[typeof payload]>('unsafe_enum').addBefore('safe', payload)],
		['new enum values added with addAfter', () => new AlterEnum<['safe']>('unsafe_enum').addAfter(payload, 'safe')],
		['enum pivots passed to addAfter', () => new AlterEnum<[typeof payload]>('unsafe_enum').addAfter('safe', payload)],
		['old enum values passed to rename', () => new AlterEnum<[typeof payload]>('unsafe_enum').rename(payload, 'safe')],
		['new enum values passed to rename', () => new AlterEnum<['safe']>('unsafe_enum').rename('safe', payload)],
		['collation locales', () => new CreateCollation('unsafe_collation', 'icu', payload, false)],
	]

	for (const [name, createStatement] of literalCases) {
		test.fails(`escapes apostrophes in ${name}`, () => {
			const query = compile(createStatement())[0]
			const escaped = payload.split("'").join("''")

			expect(query.text).toContain(`'${escaped}'`)
			expect(query.text).not.toContain(`'${payload}'`)
		})
	}
})
