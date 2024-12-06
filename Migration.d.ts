import Database from "./Database";
import { TypeString } from "./IStrongPG";
import { DatabaseSchema, TableSchema } from "./Schema";
import { AlterEnumInitialiser } from "./statements/enum/AlterEnum";
import { CreateOrReplaceFunctionInitialiser, Function } from "./statements/function/CreateOrReplaceFunction";
import { CreateIndexInitialiser } from "./statements/index/CreateIndex";
import Statement from "./statements/Statement";
import { AlterTableInitialiser } from "./statements/table/AlterTable";
import { CreateTriggerInitialiser } from "./statements/trigger/CreateTrigger";
import Transaction from "./Transaction";
export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {
    readonly schemaStart?: SCHEMA_START;
    schemaEnd?: SCHEMA_END;
    private commits;
    readonly file: string | undefined;
    private db;
    constructor(schemaStart?: SCHEMA_START);
    then(statementSupplier: (db: Database<SCHEMA_END>) => Statement<any>): this;
    createTable<NAME extends string, TABLE_SCHEMA_NEW extends TableSchema>(table: NAME, alter: NAME extends DatabaseSchema.TableName<SCHEMA_END> ? never : AlterTableInitialiser<SCHEMA_END, null, TABLE_SCHEMA_NEW>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "tables" ? ({
            [TABLE_NAME in NAME | keyof SCHEMA_END["tables"]]: TABLE_NAME extends NAME ? TABLE_SCHEMA_NEW : SCHEMA_END["tables"][TABLE_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    alterTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, TABLE_SCHEMA_NEW extends TableSchema>(table: NAME, alter: AlterTableInitialiser<SCHEMA_END, DatabaseSchema.Table<SCHEMA_END, NAME>, TABLE_SCHEMA_NEW>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "tables" ? ({
            [TABLE_NAME in NAME | keyof SCHEMA_END["tables"]]: TABLE_NAME extends NAME ? TABLE_SCHEMA_NEW : SCHEMA_END["tables"][TABLE_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    renameTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, NEW_NAME extends string>(table: NAME, newName: NEW_NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "tables" ? ({
            [TABLE_NAME in NEW_NAME | Exclude<keyof SCHEMA_END["tables"], NAME>]: TABLE_NAME extends NEW_NAME ? SCHEMA_END["tables"][NAME] : SCHEMA_END["tables"][TABLE_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    dropTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>>(table: NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "tables" ? ({
            [TABLE_NAME in Exclude<keyof SCHEMA_END["tables"], NAME>]: SCHEMA_END["tables"][TABLE_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    createIndex<NAME extends string, TABLE extends DatabaseSchema.TableName<SCHEMA_END>>(name: NAME, on: TABLE, initialiser: NAME extends DatabaseSchema.IndexName<SCHEMA_END> ? never : DatabaseSchema.Table<SCHEMA_END, TABLE> extends infer TABLE_SCHEMA extends Record<string, any> ? CreateIndexInitialiser<TABLE_SCHEMA> : never): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "indices" ? ({
            [INDEX_NAME in NAME | keyof SCHEMA_END["indices"]]: {};
        }) : SCHEMA_END[KEY];
    }>;
    dropIndex<NAME extends DatabaseSchema.IndexName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "indices" ? ({
            [INDEX_NAME in Exclude<keyof SCHEMA_END["indices"], NAME>]: {};
        }) : SCHEMA_END[KEY];
    }>;
    createEnum<NAME extends string, ENUM_SCHEMA extends string[]>(name: NAME, alter: NAME extends DatabaseSchema.EnumName<SCHEMA_END> ? never : AlterEnumInitialiser<[], ENUM_SCHEMA>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "enums" ? ({
            [ENUM_NAME in NAME | keyof SCHEMA_END["enums"]]: ENUM_NAME extends NAME ? ENUM_SCHEMA : SCHEMA_END["enums"][ENUM_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    alterEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>, ENUM_SCHEMA_NEW extends string[]>(name: NAME, alter: AlterEnumInitialiser<DatabaseSchema.Enum<SCHEMA_END, NAME>, ENUM_SCHEMA_NEW>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "enums" ? ({
            [ENUM_NAME in NAME | keyof SCHEMA_END["enums"]]: ENUM_NAME extends NAME ? ENUM_SCHEMA_NEW : SCHEMA_END["enums"][ENUM_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    dropEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "enums" ? ({
            [ENUM_NAME in Exclude<keyof SCHEMA_END["enums"], NAME>]: SCHEMA_END["enums"][ENUM_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    createOrReplaceTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends string>(on: TABLE, name: NAME, initialiser: CreateTriggerInitialiser<DatabaseSchema.Table<SCHEMA_END, TABLE>, Exclude<SCHEMA_END["functions"], undefined>>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "triggers" ? ({
            [TRIGGER_NAME in NAME | keyof SCHEMA_END["triggers"]]: {};
        }) : SCHEMA_END[KEY];
    }>;
    createConstraintTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends string>(on: TABLE, name: NAME, initialiser: CreateTriggerInitialiser<DatabaseSchema.Table<SCHEMA_END, TABLE>, Exclude<SCHEMA_END["functions"], undefined>>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "triggers" ? ({
            [TRIGGER_NAME in NAME | keyof SCHEMA_END["triggers"]]: {};
        }) : SCHEMA_END[KEY];
    }>;
    renameTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>, NEW_NAME extends string>(on: TABLE, name: NAME, newName: NEW_NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "triggers" ? ({
            [TRIGGER_NAME in NEW_NAME | Exclude<keyof SCHEMA_END["triggers"], NAME>]: {};
        }) : SCHEMA_END[KEY];
    }>;
    dropTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>>(on: TABLE, name: NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "triggers" ? ({
            [TRIGGER_NAME in Exclude<keyof SCHEMA_END["triggers"], NAME>]: {};
        }) : SCHEMA_END[KEY];
    }>;
    createOrReplaceFunction<NAME extends string, IN extends TypeString[], OUT extends [TypeString, string][], RETURN extends TypeString>(name: NAME, initialiser: CreateOrReplaceFunctionInitialiser<IN, OUT, RETURN>): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "functions" ? ({
            [FUNCTION_NAME in NAME | keyof SCHEMA_END["functions"]]: FUNCTION_NAME extends NAME ? Function<IN, OUT, RETURN> : SCHEMA_END["functions"][FUNCTION_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    dropFunction<NAME extends DatabaseSchema.FunctionName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "functions" ? ({
            [FUNCTION_NAME in Exclude<keyof SCHEMA_END["functions"], NAME>]: SCHEMA_END["functions"][FUNCTION_NAME];
        }) : SCHEMA_END[KEY];
    }>;
    createCollation<NAME extends string>(name: NAME, provider: "icu" | "libc", locale: string, deterministic: boolean): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "collations" ? ({
            [COLLATION_NAME in NAME | keyof SCHEMA_END["collations"]]: {};
        }) : SCHEMA_END[KEY];
    }>;
    dropCollation<NAME extends DatabaseSchema.CollationName<SCHEMA_END>>(name: NAME): Migration<SCHEMA_START, {
        [KEY in keyof SCHEMA_END]: KEY extends "collations" ? ({
            [FUNCTION_NAME in Exclude<keyof SCHEMA_END["collations"], NAME>]: SCHEMA_END["collations"][FUNCTION_NAME];
        }) : SCHEMA_END[KEY];
    }>;
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
