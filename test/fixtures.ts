import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'
import { vi } from 'vitest'
import Database from '../src/Database'
import { DataType } from '../src/IStrongPG'
import Schema from '../src/Schema'
import type Statement from '../src/statements/Statement'

export enum AccountState {
	Active,
	Disabled,
}

export const ACCOUNT_STATE = Schema.enum(AccountState).setName('account_state')

export const ACCOUNTS = Schema.table({
	id: DataType.BIGSERIAL,
	PRIMARY_KEY: Schema.primaryKey('id'),
	email: DataType.TEXT,
	display_name: Schema.optional(DataType.TEXT),
	state: DataType.ENUM('account_state'),
	created_at: DataType.TIMESTAMP(),
	profile: DataType.JSONB,
})

export const POSTS = Schema.table({
	id: DataType.BIGSERIAL,
	PRIMARY_KEY: Schema.primaryKey('id'),
	author_id: DataType.BIGINT,
	title: DataType.TEXT,
	body: DataType.TEXT,
	published: DataType.BOOLEAN,
})

export const TEST_SCHEMA = Schema.database({
	tables: {
		accounts: ACCOUNTS,
		posts: POSTS,
	},
	indices: {
		accounts_email_unique: Schema.INDEX,
	},
	enums: {
		account_state: ACCOUNT_STATE.VALUES,
	},
	triggers: {
		posts_changed: Schema.TRIGGER,
	},
	functions: {
		find_account: Schema.function('1')
			.in(DataType.TEXT, 'in_email')
			.returns(DataType.SETOF('accounts'))
			.sql({ text: 'SELECT * FROM accounts WHERE email = in_email' } as never),
	},
	collations: {
		ci: Schema.COLLATION,
	},
	types: {
		post_summary: Schema.table({ id: DataType.BIGINT, title: DataType.TEXT }),
	},
})

export const database = new Database(TEST_SCHEMA)

export const SQL_INJECTION_PAYLOADS = [
	"'; DROP TABLE accounts; --",
	"x' OR '1'='1",
	'0); DELETE FROM posts; --',
	'Robert\'); DROP TABLE students;--',
	'UNION SELECT pg_sleep(10)--',
] as const

export function normalizeSql (text: string) {
	return text.replace(/\s+/g, ' ').trim()
}

export function compile (statement: Statement<any>) {
	const compiled = statement.compile()
	return Array.isArray(compiled) ? compiled : [compiled]
}

export function queryResult<ROW extends QueryResultRow> (rows: ROW[] = [], rowCount = rows.length): QueryResult<ROW> {
	return {
		command: '',
		fields: [],
		oid: 0,
		rowCount,
		rows,
	}
}

export function mockClient (results: QueryResult[] = []) {
	const client = {
		query: vi.fn(async () => results.shift() ?? queryResult()),
		release: vi.fn(),
	} as unknown as PoolClient
	return client
}

export function mockPool (client = mockClient()) {
	const pool = {
		connect: vi.fn(async () => client),
	} as unknown as Pool
	return { client, pool }
}
