import { DataTypeID, EnumToTuple, InputTypeFromString, OutputTypeFromString, TypeString, TypeStringMap } from "./IStrongPG";
interface SpecialKeys<SCHEMA> {
    PRIMARY_KEY?: keyof SCHEMA | (keyof SCHEMA)[];
}
interface OptionalTypeString<TYPE extends TypeString = TypeString> {
    type: TYPE;
    optional: true;
}
type SchemaBase = Record<string, TypeString | OptionalTypeString>;
export type TableSchema = Record<string, any>;
export interface DatabaseSchema {
    tables: Record<string, TableSchema>;
    indices: Record<string, {}>;
    enums: Record<string, string[]>;
    triggers: Record<string, {}>;
    functions: Record<string, (...args: any[]) => any>;
    collations: Record<string, {}>;
}
export declare namespace DatabaseSchema {
    interface Empty {
        tables: {};
        indices: {};
        enums: {};
        triggers: {};
        functions: {};
        collations: {};
    }
    type TableName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["tables"] & string;
    type IndexName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["indices"] & string;
    type EnumName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["enums"] & string;
    type TriggerName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["triggers"] & string;
    type FunctionName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["functions"] & string;
    type CollationName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["collations"] & string;
    type Table<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> = SCHEMA["tables"][NAME] extends infer TABLE ? TABLE extends TableSchema ? TABLE : never : never;
    type Enum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> = SCHEMA["enums"][NAME] & string[];
}
type ValidateTableSchema<SCHEMA> = SpecialKeys<SCHEMA> extends infer SPECIAL_DATA ? keyof SPECIAL_DATA extends infer SPECIAL_KEYS ? Exclude<keyof SCHEMA, SPECIAL_KEYS> extends infer KEYS ? Pick<SCHEMA, KEYS & keyof SCHEMA> extends infer SCHEMA_CORE ? Pick<SCHEMA, SPECIAL_KEYS & keyof SCHEMA> extends infer SCHEMA_SPECIAL ? SCHEMA_CORE extends SchemaBase ? SCHEMA_SPECIAL extends SPECIAL_DATA ? SCHEMA : "Unknown or invalid special keys in schema" : "Invalid column types" : never : never : never : never : never;
type ValidateDatabaseSchema<SCHEMA extends DatabaseSchema> = ValidateDatabaseSchemaEnumTableColumns<SCHEMA> extends infer RESULT ? Extract<RESULT, string> extends infer ERRORS ? [
    ERRORS
] extends [never] ? SCHEMA : ERRORS : never : never;
type ValidateDatabaseSchemaEnumTableColumns<SCHEMA extends DatabaseSchema> = SCHEMA["tables"] extends {
    [key: string]: {
        [key: string]: infer ENUM_TABLE_COLUMNS;
    };
} ? Extract<ENUM_TABLE_COLUMNS, `ENUM(${string})`> extends infer ENUMS ? [
    ENUMS
] extends [never] ? SCHEMA : Extract<ENUM_TABLE_COLUMNS, `ENUM(${string})`> extends `ENUM(${infer ENUM})` ? ENUM extends keyof SCHEMA["enums"] ? SCHEMA : `Enum ${ENUM} does not exist in the database` : never : never : never;
export interface SchemaEnum<ENUM> {
    VALUES: ENUM;
}
declare class Schema {
    static database<SCHEMA extends Partial<DatabaseSchema> | null>(schema: SCHEMA): SCHEMA extends null ? null : SCHEMA extends infer S extends Partial<DatabaseSchema> ? ValidateDatabaseSchema<{
        tables: S["tables"] extends undefined ? {} : S["tables"] & {};
        indices: S["indices"] extends undefined ? {} : S["indices"] & {};
        enums: S["enums"] extends undefined ? {} : S["enums"] & {};
        triggers: S["triggers"] extends undefined ? {} : S["triggers"] & {};
        functions: S["functions"] extends undefined ? {} : S["functions"] & {};
        collations: S["collations"] extends undefined ? {} : S["collations"] & {};
    }> : never;
    static enum<ENUM extends object>(enm: ENUM): SchemaEnum<EnumToTuple<ENUM>> & { [KEY in keyof ENUM as ENUM[KEY] extends number ? KEY : never]: KEY; };
    static table<SCHEMA>(schema: SCHEMA): ValidateTableSchema<SCHEMA>;
    static readonly INDEX: {};
    static readonly TRIGGER: {};
    static readonly FUNCTION: (...args: any[]) => any;
    static readonly COLLATION: {};
    static primaryKey<KEYS extends string[]>(...keys: KEYS): KEYS[number][];
    static optional<TYPE extends TypeString>(type: TYPE): {
        type: TYPE;
        optional: true;
    };
    static getSingleColumnPrimaryKey<SCHEMA extends TableSchema>(schema: SCHEMA): Schema.Column<SCHEMA>;
    static getPrimaryKey<SCHEMA extends TableSchema>(schema: SCHEMA): Schema.Column<SCHEMA>[];
    static isColumn<SCHEMA extends TableSchema>(schema: SCHEMA, column: keyof SCHEMA, type: TypeString): boolean;
}
export default Schema;
declare namespace Schema {
    export type PrimaryKey<SCHEMA> = SCHEMA extends SpecialKeys<any> ? SCHEMA["PRIMARY_KEY"] : never;
    export type PrimaryKeyOrNull<SCHEMA> = SCHEMA extends {
        PRIMARY_KEY: infer KEY;
    } ? KEY : null;
    export type PrimaryKeyed<SCHEMA, KEY extends keyof SCHEMA | (keyof SCHEMA)[]> = SCHEMA & {
        PRIMARY_KEY: KEY;
    };
    export type DropPrimaryKey<SCHEMA> = Omit<SCHEMA, "PRIMARY_KEY">;
    export type Column<SCHEMA> = keyof SCHEMA extends infer KEYS ? KEYS extends keyof SpecialKeys<any> ? never : keyof SCHEMA : never;
    export type ColumnTyped<SCHEMA, TYPE> = keyof {
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends Vaguify<TYPE> ? COLUMN : never]: SCHEMA[COLUMN];
    };
    export type Columns<SCHEMA> = {
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN]: SCHEMA[COLUMN];
    };
    export type RowOutput<SCHEMA> = ({
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? never : COLUMN]: OutputTypeFromString<Extract<SCHEMA[COLUMN], TypeString>>;
    } & {
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? COLUMN : never]?: OutputTypeFromString<Extract<SCHEMA[COLUMN] extends OptionalTypeString<infer TYPE> ? TYPE : never, TypeString>>;
    }) extends infer T ? {
        [P in keyof T]: T[P];
    } : never;
    export type RowInput<SCHEMA, VARS = {}> = ({
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? never : COLUMN]: InputTypeFromString<Extract<SCHEMA[COLUMN], TypeString>, VARS>;
    } & {
        [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? COLUMN : never]?: InputTypeFromString<Extract<SCHEMA[COLUMN] extends OptionalTypeString<infer TYPE> ? TYPE : never, TypeString>, VARS> | null;
    }) extends infer T ? {
        [P in keyof T]: T[P];
    } : never;
    type Vaguify<T> = T extends TypeStringMap[DataTypeID.BIGINT] ? TypeStringMap[DataTypeID.BIGINT] | TypeStringMap[DataTypeID.BIGSERIAL] : T;
    export {};
}
