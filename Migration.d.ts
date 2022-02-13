import { DatabaseSchema, TableName } from "./Schema";
import AlterTable from "./statements/table/AlterTable";
import Transaction from "./Transaction";
export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {
    readonly schemaStart?: SCHEMA_START | undefined;
    schemaEnd?: SCHEMA_END;
    constructor(schemaStart?: SCHEMA_START | undefined);
    createTable<NAME extends string, TABLE_SCHEMA_NEW>(table: NAME, initialiser: (statement: AlterTable<SCHEMA_END["tables"][NAME]>) => AlterTable<SCHEMA_END["tables"][NAME], TABLE_SCHEMA_NEW>): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>>;
    alterTable<NAME extends TableName<SCHEMA_END>, TABLE_SCHEMA_NEW>(table: NAME, initialiser: (statement: AlterTable<SCHEMA_END["tables"][NAME]>) => AlterTable<SCHEMA_END["tables"][NAME], TABLE_SCHEMA_NEW>): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>>;
    schema<SCHEMA_TEST extends SCHEMA_END>(schema: SCHEMA_TEST): SCHEMA_END extends SCHEMA_TEST ? Migration<SCHEMA_START, SCHEMA_TEST> : "Migration does not match schema";
}
