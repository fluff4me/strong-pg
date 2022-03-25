import { Initialiser } from "./IStrongPG";
import { DatabaseSchema } from "./Schema";
import AlterEnum from "./statements/enum/AlterEnum";
import CreateIndex from "./statements/index/CreateIndex";
import AlterTable from "./statements/table/AlterTable";
import Transaction from "./Transaction";
export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {
    readonly schemaStart?: SCHEMA_START;
    schemaEnd?: SCHEMA_END;
    constructor(schemaStart?: SCHEMA_START);
    createTable<NAME extends string, TABLE_SCHEMA_NEW>(table: NAME, alter: NAME extends DatabaseSchema.TableName<SCHEMA_END> ? never : Initialiser<AlterTable<null>, AlterTable<null, TABLE_SCHEMA_NEW>>): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>>;
    alterTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, TABLE_SCHEMA_NEW>(table: NAME, alter: Initialiser<AlterTable<DatabaseSchema.Table<SCHEMA_END, NAME>>, AlterTable<DatabaseSchema.Table<SCHEMA_END, NAME>, TABLE_SCHEMA_NEW>>): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>>;
    dropTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>>(table: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<SCHEMA_END, NAME>>;
    createIndex<NAME extends string, TABLE extends DatabaseSchema.TableName<SCHEMA_END>>(name: NAME, on: TABLE, initialiser: NAME extends DatabaseSchema.IndexName<SCHEMA_END> ? never : DatabaseSchema.Table<SCHEMA_END, TABLE> extends infer TABLE_SCHEMA ? Initialiser<CreateIndex<NAME, TABLE_SCHEMA>, CreateIndex<NAME, TABLE_SCHEMA, true>> : never): Migration<SCHEMA_START, DatabaseSchema.CreateIndex<SCHEMA_END, NAME>>;
    dropIndex<NAME extends DatabaseSchema.IndexName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropIndex<SCHEMA_END, NAME>>;
    createEnum<NAME extends string, ENUM_SCHEMA extends string[]>(name: NAME, alter: NAME extends DatabaseSchema.EnumName<SCHEMA_END> ? never : Initialiser<AlterEnum<NAME, []>, AlterEnum<NAME, ENUM_SCHEMA>>): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA>>;
    alterEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>, ENUM_SCHEMA_NEW extends string[]>(name: NAME, alter: Initialiser<AlterEnum<NAME, DatabaseSchema.Enum<SCHEMA_END, NAME>>, AlterEnum<NAME, ENUM_SCHEMA_NEW>>): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA_NEW>>;
    dropEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropEnum<SCHEMA_END, NAME> & DatabaseSchema>;
    schema<SCHEMA_TEST extends SCHEMA_END>(schema: SCHEMA_TEST): SCHEMA_END extends SCHEMA_TEST ? Migration<SCHEMA_START, SCHEMA_TEST> : "Migration does not match schema";
}
