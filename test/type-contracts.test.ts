import { expectTypeOf, test } from 'vitest'
import { database } from './fixtures'

function invalidCallerContracts () {
	// @ts-expect-error Unknown tables are rejected.
	database.table('missing_table')

	// @ts-expect-error Unknown columns are rejected.
	database.table('accounts').select('missing_column')

	// @ts-expect-error Insert values must match their column input types.
	database.table('accounts').insert({ email: 123 })

	// @ts-expect-error Update values must match their column input types.
	database.table('accounts').update({ created_at: false })

	// @ts-expect-error Enum-backed columns accept string values, not numeric enum ordinals.
	database.table('accounts').insert({ state: 1 })

	// @ts-expect-error Returning clauses only accept columns in the table schema.
	database.table('accounts').insert({ email: 'reader@example.test' }).returning('missing_column')

	// @ts-expect-error Primary-key input must match the BIGSERIAL input contract.
	database.table('accounts').select('*').primaryKeyed(false)
}

test('preserves compile-time rejection of invalid caller input', () => {
	expectTypeOf(invalidCallerContracts).returns.toEqualTypeOf<void>()
})
