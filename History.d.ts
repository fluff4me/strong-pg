import { Pool, PoolClient } from "pg";
import Database from "./Database";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";
export declare class History<SCHEMA extends DatabaseSchema | null = null> {
    private migrations;
    protected readonly schema: SCHEMA;
    migration<MIGRATION extends Migration<any, any>>(migration: MIGRATION): MIGRATION extends Migration<infer SCHEMA_START, infer SCHEMA_END> ? SCHEMA_START extends SCHEMA ? SCHEMA extends SCHEMA_START ? History<SCHEMA_END> : null : null : null;
    migrate(db: Database<SCHEMA & DatabaseSchema>, pool: Pool | PoolClient): Promise<number>;
}
