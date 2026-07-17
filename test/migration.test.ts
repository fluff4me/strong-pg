import { describe, expect, test } from 'vitest'
import { CASCADE, DataType, NULLS_NOT_DISTINCT } from '../src/IStrongPG'
import Migration from '../src/Migration'
import Schema from '../src/Schema'
import sql from '../src/sql'
import CreateCollation from '../src/statements/collation/CreateCollation'
import DropCollation from '../src/statements/collation/DropCollation'
import AlterEnum from '../src/statements/enum/AlterEnum'
import CreateEnum from '../src/statements/enum/CreateEnum'
import DropEnum from '../src/statements/enum/DropEnum'
import CreateOrReplaceFunction from '../src/statements/function/CreateOrReplaceFunction'
import DropFunction from '../src/statements/function/DropFunction'
import CreateIndex from '../src/statements/index/CreateIndex'
import DropIndex from '../src/statements/index/DropIndex'
import AlterTable from '../src/statements/table/AlterTable'
import CreateTable from '../src/statements/table/CreateTable'
import DropTable from '../src/statements/table/DropTable'
import RenameTable from '../src/statements/table/RenameTable'
import CreateTrigger from '../src/statements/trigger/CreateTrigger'
import DropTrigger from '../src/statements/trigger/DropTrigger'
import RenameTrigger from '../src/statements/trigger/RenameTrigger'
import AlterType from '../src/statements/type/AlterType'
import CreateType from '../src/statements/type/CreateType'
import DropType from '../src/statements/type/DropType'
import { compile, normalizeSql } from './fixtures'

describe('migration statements', () => {
	test('compiles basic create, rename, and drop operations', () => {
		const statements = [
			new CreateTable('accounts'),
			new RenameTable('accounts', 'members'),
			new DropTable('members'),
			new CreateType('summary'),
			new DropType('summary'),
			new CreateEnum('state'),
			new DropEnum('state'),
			new DropIndex('accounts_email_idx'),
			new DropFunction('find_account'),
			new DropTrigger('accounts', 'accounts_changed'),
			new RenameTrigger('accounts', 'old_trigger', 'new_trigger'),
			new DropCollation('ci'),
		]

		expect(statements.flatMap(statement => compile(statement).map(query => normalizeSql(query.text))))
			.toEqual([
				'CREATE TABLE accounts ()',
				'ALTER TABLE accounts RENAME TO members',
				'DROP TABLE members',
				'CREATE TYPE summary AS ()',
				'DROP TYPE summary',
				'CREATE TYPE state AS ENUM ()',
				'DROP TYPE state',
				'DROP INDEX accounts_email_idx',
				'DROP FUNCTION find_account',
				'DROP TRIGGER accounts_changed ON accounts',
				'ALTER TRIGGER old_trigger ON accounts RENAME TO new_trigger',
				'DROP COLLATION ci',
			])
	})

	test('compiles table columns, constraints, and standalone renames', () => {
		const table = new AlterTable<any>('posts')
			.addColumn('id', DataType.BIGSERIAL, column => column.notNull())
			.addColumn('author_id', DataType.BIGINT)
			.addColumn('title', DataType.TEXT, column => column.default('Untitled').collate('ci'))
			.addPrimaryKey('id')
			.check('title_present', e => e.var('title').isNotNull())
			.foreignKey('author_id', 'accounts', 'id', CASCADE)
			.renameColumn('title', 'headline')
		const queries = compile(table).map(query => normalizeSql(query.text))

		expect(queries[0]).toContain('ALTER TABLE posts ADD COLUMN id BIGSERIAL NOT NULL')
		expect(queries[0]).toContain('ADD CONSTRAINT posts_pkey PRIMARY KEY (id)')
		expect(queries[0]).toContain('ADD CONSTRAINT title_present_check CHECK (title IS NOT NULL)')
		expect(queries[0]).toContain('REFERENCES accounts (id) ON DELETE CASCADE')
		expect(queries[1]).toBe('ALTER TABLE posts RENAME COLUMN title TO headline')
	})

	test('compiles column alterations in execution order', () => {
		const table = new AlterTable<any, { title: 'TEXT' }>('posts')
			.alterColumn('title', column => column
				.setType(DataType.VARCHAR(100))
				.setDefault('Untitled')
				.setNotNull()
				.dropDefault()
				.dropNotNull())
		const text = compile(table).map(query => normalizeSql(query.text))

		expect(text).toEqual([
			"ALTER TABLE posts ALTER COLUMN title TYPE CHARACTER VARYING(100),ALTER COLUMN title SET DEFAULT ('Untitled'),ALTER COLUMN title SET NOT NULL,ALTER COLUMN title DROP DEFAULT,ALTER COLUMN title DROP NOT NULL",
		])
	})

	test('compiles composite type and enum alterations', () => {
		const type = new AlterType<any>('post_summary')
			.addAttribute('id', DataType.BIGINT)
			.addAttribute('title', DataType.TEXT)
			.renameAttribute('title', 'headline' as never)
			.alterAttribute('headline', DataType.VARCHAR(100))
			.dropAttribute('id')
		const enm = new AlterEnum<['Active', 'Disabled']>('account_state')
			.addBefore('Invited', 'Active')
			.addAfter('Archived', 'Disabled')
			.rename('Disabled', 'Suspended')

		expect(normalizeSql(compile(type)[0].text)).toContain('ALTER TYPE post_summary ADD ATTRIBUTE')
		expect(compile(enm).map(query => normalizeSql(query.text))).toEqual([
			"ALTER TYPE account_state ADD VALUE 'Invited' BEFORE 'Active'",
			"ALTER TYPE account_state ADD VALUE 'Archived' AFTER 'Disabled'",
			"ALTER TYPE account_state RENAME VALUE 'Disabled' TO 'Suspended'",
		])
	})

	test('compiles indices, collations, functions, and triggers', () => {
		const index = new CreateIndex<{ email: 'TEXT', state: 'TEXT' }>('accounts_lookup', 'accounts')
			.unique(NULLS_NOT_DISTINCT)
			.column('email')
			.expression(e => e.lowercase(e.var('state')))
		const collation = new CreateCollation('ci', 'icu', 'und-u-ks-level2', false)
		const fn = new CreateOrReplaceFunction('find_account')
			.in(DataType.TEXT, 'in_email')
			.out(DataType.BIGINT, 'id')
			.returns(DataType.RECORD)
			.sql(sql`SELECT id FROM accounts WHERE email = in_email`)
		const trigger = new CreateTrigger<any, { touch_account: unknown }>('accounts_changed', 'accounts')
			.deferredImmediate()
			.after(events => events.insert.or.update('email').or.delete)
			.when(e => e.var('OLD.*').notEquals(e.var('NEW.*')))
			.execute('touch_account')

		expect(normalizeSql(compile(index)[0].text))
			.toBe('CREATE UNIQUE INDEX accounts_lookup ON accounts (email, lower((state))) NULLS NOT DISTINCT')
		expect(normalizeSql(compile(collation)[0].text))
			.toBe("CREATE COLLATION ci (provider=icu,locale='und-u-ks-level2',deterministic=false)")
		expect(normalizeSql(compile(fn)[0].text)).toContain('CREATE OR REPLACE FUNCTION find_account(in_email TEXT, OUT id BIGINT) RETURNS RECORD')
		expect(normalizeSql(compile(trigger)[0].text)).toContain('AFTER INSERT OR UPDATE OF email OR DELETE ON accounts')
		expect(normalizeSql(compile(trigger)[0].text)).toContain('WHEN (OLD.* != (NEW.*)) EXECUTE FUNCTION touch_account()')
	})
})

describe('Migration', () => {
	test('groups statements into numbered physical and virtual commits', () => {
		const schema = Schema.database({ tables: { things: Schema.table({ id: DataType.BIGSERIAL, PRIMARY_KEY: Schema.primaryKey('id') }) } })
		const migration = new Migration()
			.createTable('things', table => table.addColumn('id', DataType.BIGSERIAL, column => column.notNull()).addPrimaryKey('id'))
			.commit()
			.then(sql.raw('SELECT 1'))
			.schema(schema)
		const commits = migration.getCommits()

		expect(commits).toHaveLength(2)
		expect(commits[0].virtual).toBe(false)
		expect(commits[1].virtual).toBe(true)
		expect(commits[0].compile().map(query => normalizeSql(query.text))).toEqual([
			'CREATE TABLE things ()',
			'ALTER TABLE things ADD COLUMN id BIGSERIAL NOT NULL,ADD CONSTRAINT things_pkey PRIMARY KEY (id)',
		])
		expect(commits[1].compile()[0].text).toBe('SELECT 1')
	})

	test('rejects function schemas containing both SQL and PL/pgSQL bodies', () => {
		const migration = new Migration()
		const invalid = {
			version: '1',
			in: [],
			out: [],
			return: DataType.VOID,
			sql: sql`SELECT 1`,
			plpgsql: sql`RETURN;`,
		} as const

		expect(() => migration.createOrReplaceFunction('invalid', invalid as never))
			.toThrow('Cannot provide both SQL and PL/pgSQL')
	})
})
