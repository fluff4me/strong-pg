import { describe, expect, expectTypeOf, test } from 'vitest'
import { DataType, Interval, TimeUnit, TypeString } from '../src/IStrongPG'
import Schema from '../src/Schema'
import sql from '../src/sql'
import { ACCOUNT_STATE, ACCOUNTS, AccountState, TEST_SCHEMA } from './fixtures'

describe('Schema', () => {
	test('fills omitted database sections without changing provided sections', () => {
		const schema = Schema.database({ tables: { simple: Schema.table({ value: DataType.TEXT }) } })

		expect(schema?.tables.simple).toEqual({ value: DataType.TEXT })
		expect(Schema.database(null)).toBeNull()
		expectTypeOf(TEST_SCHEMA.tables.accounts).toEqualTypeOf<typeof ACCOUNTS>()
	})

	test('creates named enum values and SQL literals', () => {
		expect(ACCOUNT_STATE.VALUES).toEqual(['Active', 'Disabled'])
		expect(ACCOUNT_STATE.Active).toBe('Active')
		expect(ACCOUNT_STATE.sql.Active.text).toBe("'Active'::account_state")

		const unnamed = Schema.enum(AccountState)
		expect(unnamed.sql.Disabled.text).toBe("'Disabled'")
	})

	test('builds function and trigger-function schemas', () => {
		const body = sql`SELECT 1`
		const fn = Schema.function('2')
			.in(DataType.TEXT, 'input')
			.out(DataType.INTEGER, 'count')
			.returns(DataType.RECORD)
			.sql(body)
		const trigger = Schema.triggerFunction('3').plpgsql({ row: DataType.RECORD }, sql`RETURN NEW;`)

		expect(fn).toEqual({
			version: '2',
			in: [[DataType.TEXT, 'input']],
			out: [[DataType.INTEGER, 'count']],
			return: DataType.RECORD,
			sql: body,
		})
		expect(trigger).toMatchObject({ version: '3', in: [], out: [], return: 'TRIGGER', declarations: { row: 'RECORD' } })
	})

	test('resolves primary keys and reports invalid primary-key shapes', () => {
		expect(Schema.getSingleColumnPrimaryKey(ACCOUNTS)).toBe('id')
		expect(Schema.getPrimaryKey(ACCOUNTS)).toEqual(['id'])
		expect(() => Schema.getPrimaryKey({ value: DataType.TEXT })).toThrow('No primary key')
		expect(() => Schema.getSingleColumnPrimaryKey({
			a: DataType.TEXT,
			b: DataType.TEXT,
			PRIMARY_KEY: Schema.primaryKey('a', 'b'),
		})).toThrow('multiple columns')
	})

	test('recognizes exact and parameterized timestamp columns', () => {
		expect(Schema.isColumn(ACCOUNTS, 'created_at', DataType.TIMESTAMP())).toBe(true)
		expect(Schema.isColumn(ACCOUNTS, 'email', DataType.TEXT)).toBe(true)
		expect(Schema.isColumn(ACCOUNTS, 'email', DataType.INTEGER)).toBe(false)
		expect(() => Schema.isColumn(ACCOUNTS, 'missing' as never, DataType.TEXT)).toThrow('No column missing')
	})

	test('constructs and resolves data types', () => {
		expect(DataType.NUMERIC()).toBe('NUMERIC')
		expect(DataType.NUMERIC(10.2, 2.4)).toBe('NUMERIC(10,2)')
		expect(DataType.TIMESTAMP(3, true)).toBe('TIMESTAMP(3) WITHOUT TIME ZONE')
		expect(DataType.TIME(3, true)).toBe('TIME(3) WITHOUT TIME ZONE')
		expect(DataType.CHAR(4.4)).toBe('CHARACTER(4)')
		expect(DataType.VARCHAR()).toBe('CHARACTER VARYING')
		expect(DataType.BIT(8)).toBe('BIT(8)')
		expect(DataType.VARBIT(8)).toBe('BIT VARYING(8)')
		expect(DataType.ENUM('account_state')).toBe('ENUM(account_state)')
		expect(DataType.SETOF('accounts')).toBe('SETOF accounts')
		expect(DataType.ARRAY(DataType.TEXT)).toBe('TEXT[]')
		expect(DataType.ARRAYOF('accounts')).toBe('accounts[]')
		expect(TypeString.resolve(DataType.ENUM('account_state'))).toBe('account_state')
		expect(TypeString.resolve(DataType.ARRAY(DataType.ENUM('account_state')))).toBe('account_state[]')
		expect(TypeString.resolve(Schema.optional(DataType.TEXT))).toBe('TEXT')
	})

	test('validates interval input before emitting trusted SQL', () => {
		expect(TimeUnit.UNITS).toEqual(['years', 'months', 'days', 'hours', 'minutes', 'seconds'])
		expect(TimeUnit.is('minutes')).toBe(true)
		expect(TimeUnit.is('weeks')).toBe(false)
		expect(Interval(5, 'minutes').text).toBe("INTERVAL '5 minutes'")
		expect(() => Interval(-1, 'days')).toThrow('non-negative integer')
		expect(() => Interval(1.5, 'days')).toThrow('non-negative integer')
		expect(() => Interval(1, 'weeks' as never)).toThrow('unit must be one of')
	})
})
