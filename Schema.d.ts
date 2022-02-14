import { Merge2, ReplaceKey, TypeString } from "./IStrongPG";
interface SpecialKeys<SCHEMA> {
    PRIMARY_KEY?: keyof SCHEMA | (keyof SCHEMA)[];
}
declare type SchemaBase = Record<string, TypeString>;
export interface DatabaseSchema {
    tables: Record<string, Record<string, any>>;
}
export declare namespace DatabaseSchema {
    interface Empty {
        tables: {};
    }
    type ReplaceTable<SCHEMA extends DatabaseSchema, TABLE extends TableName<SCHEMA>, TABLE_SCHEMA_NEW> = ReplaceKey<SCHEMA, "tables", ReplaceKey<SCHEMA["tables"], TABLE, TABLE_SCHEMA_NEW>>;
    type DropTable<SCHEMA extends DatabaseSchema, TABLE extends TableName<SCHEMA>> = ReplaceKey<SCHEMA, "tables", Pick<SCHEMA["tables"], Exclude<keyof SCHEMA["tables"], TABLE>>>;
}
export declare type TableName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["tables"] & string;
export declare function Schema<SCHEMA extends DatabaseSchema>(schema: SCHEMA): SCHEMA;
export declare namespace Schema {
    export type PrimaryKey<SCHEMA> = SCHEMA extends SpecialKeys<any> ? SCHEMA["PRIMARY_KEY"] : never;
    export type PrimaryKeyOrNull<SCHEMA> = SCHEMA extends {
        PRIMARY_KEY: infer KEY;
    } ? KEY : null;
    export type PrimaryKeyed<SCHEMA, KEY extends keyof SCHEMA | (keyof SCHEMA)[]> = Merge2<SCHEMA, {
        PRIMARY_KEY: KEY;
    }>;
    export type DropPrimaryKey<SCHEMA> = Pick<SCHEMA, Exclude<keyof SCHEMA, "PRIMARY_KEY">>;
    export function primaryKey<KEYS extends string[]>(...keys: KEYS): KEYS[number][];
    type ValidateTableSchema<SCHEMA> = SpecialKeys<SCHEMA> extends infer SPECIAL_DATA ? keyof SPECIAL_DATA extends infer SPECIAL_KEYS ? Exclude<keyof SCHEMA, SPECIAL_KEYS> extends infer KEYS ? Pick<SCHEMA, KEYS & keyof SCHEMA> extends infer SCHEMA_CORE ? Pick<SCHEMA, SPECIAL_KEYS & keyof SCHEMA> extends infer SCHEMA_SPECIAL ? SCHEMA_CORE extends SchemaBase ? SCHEMA_SPECIAL extends SPECIAL_DATA ? SCHEMA : "Unknown or invalid special keys in schema" : "Invalid column types" : never : never : never : never : never;
    export function table<SCHEMA>(schema: SCHEMA): ValidateTableSchema<SCHEMA>;
    export {};
}
export {};
