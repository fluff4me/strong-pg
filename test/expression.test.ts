import { describe, expect, test } from 'vitest'
import Expression from '../src/expressions/Expression'
import { DataType } from '../src/IStrongPG'
import { database, normalizeSql } from './fixtures'

function expression (initialiser: (expression: any) => any) {
	return Expression.compile(initialiser as never)
}

describe('Expression', () => {
	test('compiles comparisons, null checks, and boolean composition', () => {
		const query = expression(e => e.var('age').greaterThan(17)
			.and(e.var('email').notEquals('blocked@example.test'))
			.or(e.var('deleted_at').isNull()))

		expect(normalizeSql(query.text)).toBe('age > 17 AND (email != $1) OR (deleted_at IS NULL)')
		expect(query.values).toEqual(['blocked@example.test'])
	})

	test('compiles every comparison and arithmetic operator', () => {
		expect(expression(e => e.value(2).lessThan(3)).text).toBe('2 < 3')
		expect(expression(e => e.value(2).greaterThanOrEquals(2)).text).toBe('2 >= 2')
		expect(expression(e => e.value(2).lessThanOrEquals(3)).text).toBe('2 <= 3')
		expect(expression(e => e.value('abc').matches(/a'bc/)).text).toBe("$1 ~ 'a''bc'")
		expect(expression(e => e.value(8).add(2).subtract(1).multipliedBy(3).dividedBy(9)).text)
			.toBe('8 + 2 - 1 * 3 / 9')
	})

	test('compiles casts, case expressions, and coalesce', () => {
		const cast = expression(e => e.value('1').as(DataType.INTEGER).asEnum('account_state'))
		expect(cast).toMatchObject({ text: '$1 :: INTEGER :: account_state', values: ['1'] })

		const conditional = expression(e => e.case((builder: any) => builder
			.when(e.var('enabled').equals(true)).then('yes')
			.otherwise('no')))
		expect(normalizeSql(conditional.text)).toBe('CASE WHEN ((enabled = TRUE)) THEN ($1) ELSE ($2) END')
		expect(conditional.values).toEqual(['yes', 'no'])

		const coalesce = expression(e => e.coalesce(e.var('display_name'), 'Anonymous'))
		expect(coalesce).toMatchObject({ text: 'COALESCE((display_name),$1)', values: ['Anonymous'] })
	})

	test('builds some and every predicates with shared variables', () => {
		const some = expression(e => e.some(['a', 'b'], (inner: any, value: string) => inner.var('email').equals(value)))
		const every = expression(e => e.every([1, 2], (inner: any, value: number) => inner.var('score').greaterThan(value)))

		expect(some).toMatchObject({ text: '(email = $1) OR (email = $2)', values: ['a', 'b'] })
		expect(every).toMatchObject({ text: '(score > 1) AND (score > 2)', values: [] })
	})

	test('encodes JSONB and case conversion', () => {
		const json = expression(e => e.jsonb({ quote: "O'Reilly", enabled: true }))
		const lower = expression(e => e.lowercase('LOUD'))
		const upper = expression(e => e.uppercase('quiet'))

		expect(json.text).toBe('$1 :: JSONB')
		expect(json.values).toEqual(['{"quote":"O\'Reilly","enabled":true}'])
		expect(lower).toMatchObject({ text: 'lower($1)', values: ['LOUD'] })
		expect(upper).toMatchObject({ text: 'upper($1)', values: ['quiet'] })
	})

	test('compiles sequence and constant values', () => {
		expect(expression(e => e.nextValue('accounts_id_seq')).text).toBe("nextval('accounts_id_seq')")
		expect(expression(e => e.currentValue('accounts_id_seq')).text).toBe("currval('accounts_id_seq')")
		expect(expression(e => e.true).text).toBe('1=1')
		expect(expression(e => e.false).text).toBe('1=0')
	})

	test('embeds exists and not-exists subqueries with shared parameters', () => {
		const exists = expression(e => e.exists(database, 'accounts', (select: any) => select
			.where((inner: any) => inner.var('email').equals("reader's@example.test"))))
		const notExists = expression(e => e.notExists(database, 'posts', (select: any) => select
			.where((inner: any) => inner.var('published').equals(false))))

		expect(normalizeSql(exists.text)).toContain('EXISTS (SELECT')
		expect(exists.values).toEqual(["reader's@example.test"])
		expect(normalizeSql(notExists.text)).toContain('NOT EXISTS (SELECT')
		expect(notExists.text).toContain('published = FALSE')
	})

	test('reuses placeholders for repeated object and string references', () => {
		const profile = { role: 'reader' }
		const query = expression(e => e.value(profile).equals(profile).and(e.value('same').equals('same')))

		expect(query.values).toEqual([profile, 'same'])
		expect(query.text).toBe('$1 = $1 AND ($2 = $2)')
	})
})
