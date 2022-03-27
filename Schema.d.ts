import { EnumToTuple, SetKey, TypeString } from "./IStrongPG";
interface SpecialKeys<SCHEMA> {
    PRIMARY_KEY?: keyof SCHEMA | (keyof SCHEMA)[];
}
declare type SchemaBase = Record<string, TypeString>;
export interface DatabaseSchema {
    tables: Record<string, Record<string, any>>;
    indices?: Record<string, {}>;
    enums?: Record<string, string[]>;
    triggers?: Record<string, {}>;
    functions?: Record<string, any>;
}
export declare namespace DatabaseSchema {
    interface Empty {
        tables: {};
    }
    type TableName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["tables"] & string;
    type IndexName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["indices"] & string;
    type EnumName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["enums"] & string;
    type TriggerName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["triggers"] & string;
    type Table<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> = SCHEMA["tables"][NAME];
    type ReplaceTable<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>, TABLE_SCHEMA_NEW> = SetKey<SCHEMA, "tables", SetKey<SCHEMA["tables"], NAME, TABLE_SCHEMA_NEW>>;
    type DropTable<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> = SetKey<SCHEMA, "tables", Omit<SCHEMA["tables"], NAME>>;
    type CreateIndex<SCHEMA extends DatabaseSchema, NAME extends string> = SetKey<SCHEMA, "indices", SetKey<SCHEMA["indices"], NAME, {}>>;
    type DropIndex<SCHEMA extends DatabaseSchema, NAME extends IndexName<SCHEMA>> = SetKey<SCHEMA, "indices", Omit<SCHEMA["indices"], NAME>>;
    type Enum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> = SCHEMA["enums"][NAME] & string[];
    type ReplaceEnum<SCHEMA extends DatabaseSchema, NAME extends string, ENUM extends string[]> = SetKey<SCHEMA, "enums", SetKey<SCHEMA["enums"], NAME, ENUM>>;
    type DropEnum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> = SetKey<SCHEMA, "enums", Omit<SCHEMA["enums"], NAME>>;
    type CreateTrigger<SCHEMA extends DatabaseSchema, NAME extends string> = SetKey<SCHEMA, "triggers", SetKey<SCHEMA["triggers"], NAME, {}>>;
    type DropTrigger<SCHEMA extends DatabaseSchema, NAME extends TriggerName<SCHEMA>> = SetKey<SCHEMA, "triggers", Omit<SCHEMA["triggers"], NAME>>;
}
declare type ValidateTableSchema<SCHEMA> = SpecialKeys<SCHEMA> extends infer SPECIAL_DATA ? keyof SPECIAL_DATA extends infer SPECIAL_KEYS ? Exclude<keyof SCHEMA, SPECIAL_KEYS> extends infer KEYS ? Pick<SCHEMA, KEYS & keyof SCHEMA> extends infer SCHEMA_CORE ? Pick<SCHEMA, SPECIAL_KEYS & keyof SCHEMA> extends infer SCHEMA_SPECIAL ? SCHEMA_CORE extends SchemaBase ? SCHEMA_SPECIAL extends SPECIAL_DATA ? SCHEMA : "Unknown or invalid special keys in schema" : "Invalid column types" : never : never : never : never : never;
declare type ValidateDatabaseSchema<SCHEMA extends DatabaseSchema> = ValidateDatabaseSchemaEnumTableColumns<SCHEMA> extends infer RESULT ? Extract<RESULT, string> extends infer ERRORS ? [
    ERRORS
] extends [never] ? SCHEMA : ERRORS : never : never;
declare type ValidateDatabaseSchemaEnumTableColumns<SCHEMA extends DatabaseSchema> = SCHEMA["tables"] extends {
    [key: string]: {
        [key: string]: infer ENUM_TABLE_COLUMNS;
    };
} ? Extract<ENUM_TABLE_COLUMNS, `ENUM(${string})`> extends infer ENUMS ? [
    ENUMS
] extends [never] ? SCHEMA : Extract<ENUM_TABLE_COLUMNS, `ENUM(${string})`> extends `ENUM(${infer ENUM})` ? ENUM extends keyof SCHEMA["enums"] ? SCHEMA : `Enum ${ENUM} does not exist in the database` : never : never : never;
declare class Schema {
    static database<SCHEMA extends DatabaseSchema | null>(schema: SCHEMA): SCHEMA extends null ? null : ValidateDatabaseSchema<Extract<SCHEMA, DatabaseSchema>>;
    static enum<ENUM extends object>(enm: ENUM): EnumToTuple<ENUM, []>;
    static table<SCHEMA>(schema: SCHEMA): ValidateTableSchema<SCHEMA>;
    static readonly INDEX: {};
    static readonly TRIGGER: {};
    static primaryKey<KEYS extends string[]>(...keys: KEYS): KEYS[number][];
}
export default Schema;
declare namespace Schema {
    type PrimaryKey<SCHEMA> = SCHEMA extends SpecialKeys<any> ? SCHEMA["PRIMARY_KEY"] : never;
    type PrimaryKeyOrNull<SCHEMA> = SCHEMA extends {
        PRIMARY_KEY: infer KEY;
    } ? KEY : null;
    type PrimaryKeyed<SCHEMA, KEY extends keyof SCHEMA | (keyof SCHEMA)[]> = SCHEMA & {
        PRIMARY_KEY: KEY;
    };
    type DropPrimaryKey<SCHEMA> = Omit<SCHEMA, "PRIMARY_KEY">;
    type Column<SCHEMA> = keyof SCHEMA extends infer KEYS ? KEYS extends keyof SpecialKeys<any> ? never : keyof SCHEMA : never;
    type Columns<SCHEMA> = {
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN]: SCHEMA[COLUMN];
    };
}
