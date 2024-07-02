import { Pool, PoolClient } from "pg";
import { History } from "./History";
import { DatabaseSchema } from "./Schema";
import Table from "./Table";

export default class Database<SCHEMA extends DatabaseSchema> {

	protected history?: History<SCHEMA>;

	public constructor (protected readonly schema: SCHEMA) {

	}

	public async migrate (pool: Pool | PoolClient) {
		return this.history?.migrate(this, pool);
	}

	public setHistory (initialiser: (history: History) => History<SCHEMA>) {
		this.history = initialiser(new History());
		return this;
	}

	/**
	 * Drops the database if the environment variable `DEBUG_PG_ALLOW_DROP` is set
	 */
	public async dropIfShould (pool: Pool | PoolClient) {
		if (!process.env.DEBUG_PG_ALLOW_DROP)
			return;

		return pool.query("DROP OWNED BY CURRENT_USER CASCADE");
	}

	public table<TABLE_NAME extends DatabaseSchema.TableName<SCHEMA>> (tableName: TABLE_NAME) {
		type TABLE = DatabaseSchema.Table<SCHEMA, TABLE_NAME>;
		return new Table<TABLE, SCHEMA, TABLE_NAME>(tableName, this.schema.tables[tableName as string] as TABLE);
	}
}
