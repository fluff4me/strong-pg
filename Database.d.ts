import { Pool } from "pg";
import { History } from "./History";
import { DatabaseSchema } from "./Schema";
export default class Database<SCHEMA extends DatabaseSchema> {
    protected readonly schema: SCHEMA;
    protected readonly pool: Pool;
    protected history?: History<SCHEMA>;
    constructor(schema: SCHEMA, pool: Pool);
    migrate(): Promise<number | undefined>;
    setHistory(initialiser: (history: History) => History<SCHEMA>): this;
    /**
     * Drops the database if the environment variable `DEBUG_PG_ALLOW_DROP` is set
     */
    dropIfShould(): Promise<import("pg").QueryResult<any> | undefined>;
}
