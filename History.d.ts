import { DatabaseError, Pool, PoolClient } from "pg";
import Database from "./Database";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";
interface MigrationGroup<START extends DatabaseSchema | null, END extends DatabaseSchema> {
    (history: History<START>): History<END>;
}
declare function MigrationGroup<START extends DatabaseSchema | null, END extends DatabaseSchema>(group: MigrationGroup<START, END>): MigrationGroup<START, END>;
export { MigrationGroup };
export declare class History<SCHEMA extends DatabaseSchema | null = null> {
    private migrations;
    protected readonly schema: SCHEMA;
    rolledBack: boolean | undefined;
    rollbackError: DatabaseError | undefined;
    group<SCHEMA_END extends DatabaseSchema>(group: MigrationGroup<SCHEMA, SCHEMA_END>): History<SCHEMA_END>;
    migration<MIGRATION extends Migration<any, any>>(migration: MIGRATION): MIGRATION extends Migration<infer SCHEMA_START, infer SCHEMA_END> ? SCHEMA_START extends SCHEMA ? SCHEMA extends SCHEMA_START ? History<SCHEMA_END> : null : null : null;
    migrate(db: Database<SCHEMA & DatabaseSchema>, pool: Pool | PoolClient): Promise<number>;
}
