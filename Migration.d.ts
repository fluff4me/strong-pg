import { DatabaseSchema } from "./Schema";
import { AlterEnumInitialiser } from "./statements/enum/AlterEnum";
import { CreateOrReplaceFunctionInitialiser } from "./statements/function/CreateOrReplaceFunction";
import { CreateIndexInitialiser } from "./statements/index/CreateIndex";
import { AlterTableInitialiser } from "./statements/table/AlterTable";
import { CreateTriggerInitialiser } from "./statements/trigger/CreateTrigger";
import Transaction from "./Transaction";
export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {
    readonly schemaStart?: SCHEMA_START;
    schemaEnd?: SCHEMA_END;
    private commits;
    readonly file: string | undefined;
    constructor(schemaStart?: SCHEMA_START);
    createTable<NAME extends string, TABLE_SCHEMA_NEW>(table: NAME, alter: NAME extends DatabaseSchema.TableName<SCHEMA_END> ? never : AlterTableInitialiser<SCHEMA_END, null, TABLE_SCHEMA_NEW>): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>>;
    alterTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, TABLE_SCHEMA_NEW>(table: NAME, alter: AlterTableInitialiser<SCHEMA_END, DatabaseSchema.Table<SCHEMA_END, NAME>, TABLE_SCHEMA_NEW>): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>>;
    renameTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, NEW_NAME extends string>(table: NAME, newName: NEW_NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<DatabaseSchema.ReplaceTable<SCHEMA_END, NEW_NAME, DatabaseSchema.Table<SCHEMA_END, NAME>>, NAME>>;
    dropTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>>(table: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<SCHEMA_END, NAME>>;
    createIndex<NAME extends string, TABLE extends DatabaseSchema.TableName<SCHEMA_END>>(name: NAME, on: TABLE, initialiser: NAME extends DatabaseSchema.IndexName<SCHEMA_END> ? never : DatabaseSchema.Table<SCHEMA_END, TABLE> extends infer TABLE_SCHEMA extends Record<string, any> ? CreateIndexInitialiser<TABLE_SCHEMA> : never): Migration<SCHEMA_START, DatabaseSchema.CreateIndex<SCHEMA_END, NAME>>;
    dropIndex<NAME extends DatabaseSchema.IndexName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropIndex<SCHEMA_END, NAME>>;
    createEnum<NAME extends string, ENUM_SCHEMA extends string[]>(name: NAME, alter: NAME extends DatabaseSchema.EnumName<SCHEMA_END> ? never : AlterEnumInitialiser<[], ENUM_SCHEMA>): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA>>;
    alterEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>, ENUM_SCHEMA_NEW extends string[]>(name: NAME, alter: AlterEnumInitialiser<DatabaseSchema.Enum<SCHEMA_END, NAME>, ENUM_SCHEMA_NEW>): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA_NEW>>;
    dropEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropEnum<SCHEMA_END, NAME> & DatabaseSchema>;
    createTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends string>(on: TABLE, name: NAME, initialiser: CreateTriggerInitialiser<DatabaseSchema.Table<SCHEMA_END, TABLE>, Exclude<SCHEMA_END["functions"], undefined>>): Migration<SCHEMA_START, DatabaseSchema.CreateTrigger<SCHEMA_END, NAME>>;
    renameTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>, NEW_NAME extends string>(on: TABLE, name: NAME, newName: NEW_NAME): Migration<SCHEMA_START, DatabaseSchema.DropTrigger<DatabaseSchema.CreateTrigger<SCHEMA_END, NEW_NAME>, NAME>>;
    dropTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>>(on: TABLE, name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTrigger<SCHEMA_END, NAME> & DatabaseSchema>;
    createOrReplaceFunction<NAME extends string>(name: NAME, initialiser: CreateOrReplaceFunctionInitialiser): Migration<SCHEMA_START, DatabaseSchema.CreateFunction<SCHEMA_END, NAME, (...args: any[]) => any>>;
    dropFunction<NAME extends DatabaseSchema.FunctionName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropFunction<SCHEMA_END, NAME> & DatabaseSchema>;
    createCollation<NAME extends string>(name: NAME, provider: "icu" | "libc", locale: string, deterministic: boolean): Migration<SCHEMA_START, DatabaseSchema.CreateCollation<SCHEMA_END, NAME>>;
    dropCollation<NAME extends DatabaseSchema.CollationName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropCollation<SCHEMA_END, NAME> & DatabaseSchema>;
    commit(): this;
    getCommits(): MigrationCommit[];
    schema<SCHEMA_TEST extends SCHEMA_END>(schema: SCHEMA_TEST): SCHEMA_END extends SCHEMA_TEST ? Migration<SCHEMA_START, SCHEMA_TEST> : "Migration does not match schema";
}
export type MigrationVersion = `${number}` | `${number}.${number}`;
export declare class MigrationCommit extends Transaction {
    readonly file: string | undefined;
    readonly virtual: boolean;
    version?: MigrationVersion;
    constructor(file: string | undefined, virtual: boolean);
}
