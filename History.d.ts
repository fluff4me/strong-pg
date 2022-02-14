import { Pool } from "pg";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";
export declare class History<SCHEMA extends DatabaseSchema | null = null> {
    private migrations;
    migration<SCHEMA_END extends DatabaseSchema>(migration: Migration<SCHEMA, SCHEMA_END>): History<SCHEMA_END>;
    migrate(pool: Pool): Promise<number>;
}
