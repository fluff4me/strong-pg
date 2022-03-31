import { Pool } from "pg";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";
export declare class History<SCHEMA extends DatabaseSchema | null = null> {
    private migrations;
    protected readonly schema: SCHEMA;
    migration<MIGRATION extends Migration<any, any>>(migration: MIGRATION): MIGRATION extends Migration<infer SCHEMA_START, infer SCHEMA_END> ? SCHEMA_START extends SCHEMA ? SCHEMA extends SCHEMA_START ? History<SCHEMA_END> : null : null : null;
    migrate(pool: Pool): Promise<number>;
    private log;
}
