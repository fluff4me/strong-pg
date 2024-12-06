import { Pool, PoolClient } from "pg";
import FunctionCall from "./FunctionCall";
import { History } from "./History";
import { DatabaseSchema, FunctionParameters } from "./Schema";
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
    function<FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>>(functionName: FUNCTION_NAME, ...params: FunctionParameters<DatabaseSchema.Function<SCHEMA, FUNCTION_NAME>>): FunctionCall<DatabaseSchema.Function<SCHEMA, FUNCTION_NAME>, SCHEMA, FUNCTION_NAME, import("./FunctionCall").FunctionOutput<SCHEMA, DatabaseSchema.Function<SCHEMA, FUNCTION_NAME>, FUNCTION_NAME>>;
}
