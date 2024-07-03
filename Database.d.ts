import { Pool, PoolClient } from "pg";
import { History } from "./History";
import { DatabaseSchema } from "./Schema";
import Table from "./Table";
export default class Database<SCHEMA extends DatabaseSchema> {
    protected readonly schema: SCHEMA;
    protected history?: History<SCHEMA>;
    constructor(schema: SCHEMA);
    migrate(pool: Pool | PoolClient): Promise<number | undefined>;
    setHistory(initialiser: (history: History) => History<SCHEMA>): this;
    /**
     * Drops the database if the environment variable `DEBUG_PG_ALLOW_DROP` is set
     */
    dropIfShould(pool: Pool | PoolClient): Promise<import("pg").QueryResult<any> | undefined>;
    table<TABLE_NAME extends DatabaseSchema.TableName<SCHEMA>>(tableName: TABLE_NAME): Table<DatabaseSchema.Table<SCHEMA, TABLE_NAME>, SCHEMA, TABLE_NAME>;
}
