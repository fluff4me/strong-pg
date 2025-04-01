import { ExpressionOr } from "./expressions/Expression";
export declare const CASCADE: unique symbol;
export declare const SET_NULL: unique symbol;
export declare const SET_DEFAULT: unique symbol;
export type ForeignKeyOnDeleteAction = typeof CASCADE | typeof SET_NULL | typeof SET_DEFAULT;
export type Type = DataTypeID;
export declare enum DataTypeID {
    SMALLINT = 0,
    INTEGER = 1,
    BIGINT = 2,
    NUMERIC = 3,
    REAL = 4,
    DOUBLE = 5,
    SMALLSERIAL = 6,
    SERIAL = 7,
    BIGSERIAL = 8,
    DATE = 9,
    TIMESTAMP = 10,
    TIME = 11,
    CHAR = 12,
    VARCHAR = 13,
    BYTECHAR = 14,
    BIT = 15,
    VARBIT = 16,
    TEXT = 17,
    ENUM = 18,
    UUID = 19,
    BOOLEAN = 20,
    TSVECTOR = 21,
    JSON = 22,
    JSONB = 23,
    RECORD = 24,
    SETOF = 25,
    TRIGGER = 26,
    VOID = 27,
    ARRAY = 28
}
export interface TypeStringMap {
    [DataTypeID.SMALLINT]: "SMALLINT";
    [DataTypeID.INTEGER]: "INTEGER";
    [DataTypeID.BIGINT]: "BIGINT";
    [DataTypeID.NUMERIC]: "NUMERIC" | `NUMERIC(${bigint})` | `NUMERIC(${bigint},${bigint})`;
    [DataTypeID.REAL]: "REAL";
    [DataTypeID.DOUBLE]: "DOUBLE PRECISION";
    [DataTypeID.SMALLSERIAL]: "SMALLSERIAL";
    [DataTypeID.SERIAL]: "SERIAL";
    [DataTypeID.BIGSERIAL]: "BIGSERIAL";
    [DataTypeID.DATE]: "DATE";
    [DataTypeID.TIMESTAMP]: "TIMESTAMP" | `TIMESTAMP(${bigint})` | `TIMESTAMP(${bigint}) WITHOUT TIME ZONE`;
    [DataTypeID.TIME]: "TIME" | `TIME(${bigint})` | `TIME(${bigint}) WITHOUT TIME ZONE`;
    [DataTypeID.BYTECHAR]: "\"char\"";
    [DataTypeID.CHAR]: "CHARACTER" | `CHARACTER(${bigint})`;
    [DataTypeID.VARCHAR]: "CHARACTER VARYING" | `CHARACTER VARYING(${bigint})`;
    [DataTypeID.BIT]: `BIT(${bigint})`;
    [DataTypeID.VARBIT]: "BIT VARYING" | `BIT VARYING(${bigint})`;
    [DataTypeID.TEXT]: "TEXT";
    [DataTypeID.ENUM]: `ENUM(${string})`;
    [DataTypeID.BOOLEAN]: "BOOLEAN";
    [DataTypeID.TSVECTOR]: "TSVECTOR";
    [DataTypeID.JSON]: "JSON";
    [DataTypeID.JSONB]: "JSONB";
    [DataTypeID.UUID]: "UUID";
    [DataTypeID.RECORD]: "RECORD";
    [DataTypeID.SETOF]: `SETOF ${string}`;
    [DataTypeID.TRIGGER]: "TRIGGER";
    [DataTypeID.VOID]: "VOID";
    [DataTypeID.ARRAY]: `${string}[]`;
}
export declare namespace DataType {
    const SMALLINT: TypeStringMap[DataTypeID.SMALLINT];
    const INTEGER: TypeStringMap[DataTypeID.INTEGER];
    const BIGINT: TypeStringMap[DataTypeID.BIGINT];
    function NUMERIC(precision?: number, scale?: number): TypeStringMap[DataTypeID.NUMERIC];
    const REAL: TypeStringMap[DataTypeID.REAL];
    const DOUBLE: TypeStringMap[DataTypeID.DOUBLE];
    const SMALLSERIAL: TypeStringMap[DataTypeID.SMALLSERIAL];
    const SERIAL: TypeStringMap[DataTypeID.SERIAL];
    const BIGSERIAL: TypeStringMap[DataTypeID.BIGSERIAL];
    const DATE = "DATE";
    function TIMESTAMP(precision?: number, withoutTimeZone?: true): TypeStringMap[DataTypeID.TIMESTAMP];
    function TIME(precision?: number, withoutTimeZone?: true): TypeStringMap[DataTypeID.TIMESTAMP];
    function CHAR(length?: number): TypeStringMap[DataTypeID.CHAR];
    function VARCHAR(length?: number): TypeStringMap[DataTypeID.VARCHAR];
    const BYTECHAR: TypeStringMap[DataTypeID.BYTECHAR];
    function BIT(length: number): TypeStringMap[DataTypeID.BIT];
    function VARBIT(length?: number): `BIT VARYING(${bigint})` | "BIT VARYING";
    const TEXT: TypeStringMap[DataTypeID.TEXT];
    function ENUM<NAME extends string>(name: NAME): Enum<NAME>;
    type Enum<NAME extends string> = `ENUM(${NAME})`;
    type EnumName<ENUM_TYPE extends `ENUM(${string})`> = ENUM_TYPE extends `ENUM(${infer NAME})` ? NAME : never;
    const UUID: TypeStringMap[DataTypeID.UUID];
    const BOOLEAN: TypeStringMap[DataTypeID.BOOLEAN];
    const TSVECTOR: TypeStringMap[DataTypeID.TSVECTOR];
    const JSON: TypeStringMap[DataTypeID.JSON];
    const JSONB: TypeStringMap[DataTypeID.JSONB];
    const RECORD: TypeStringMap[DataTypeID.RECORD];
    const TRIGGER: TypeStringMap[DataTypeID.TRIGGER];
    const VOID: TypeStringMap[DataTypeID.VOID];
    function SETOF<TABLENAME extends string>(tablename: TABLENAME): `SETOF ${TABLENAME}`;
    function ARRAY<TYPE extends TypeString>(type: TYPE): `${TYPE}[]`;
    function ARRAYOF<TABLENAME extends string>(type: TABLENAME): `${TABLENAME}[]`;
}
export type TypeString = TypeStringMap[DataTypeID] | "*";
export interface OptionalTypeString<TYPE extends TypeString = TypeString> {
    type: TYPE;
    optional: true;
}
export type MakeOptional<TYPE> = TYPE extends TypeString ? OptionalTypeString<TYPE> : TYPE;
export type ExtractTypeString<TYPE extends TypeString | OptionalTypeString> = TYPE extends OptionalTypeString<infer TYPE2> ? TYPE2 : TYPE;
export type DataTypeFromString<STR extends TypeString | OptionalTypeString> = (STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE ? {
    [DATATYPE in DataTypeID as TYPE extends TypeStringMap[DATATYPE] ? DATATYPE : never]: DATATYPE;
} extends infer DATATYPE_RESULT ? DATATYPE_RESULT[keyof DATATYPE_RESULT] & DataTypeID : never : never;
export type ValidDate = Date | number | typeof CURRENT_TIMESTAMP;
export interface MigrationTypeMap {
    [DataTypeID.SMALLINT]: number;
    [DataTypeID.INTEGER]: number;
    [DataTypeID.BIGINT]: number | bigint | `${bigint}`;
    [DataTypeID.NUMERIC]: number;
    [DataTypeID.REAL]: number;
    [DataTypeID.DOUBLE]: number;
    [DataTypeID.SMALLSERIAL]: number;
    [DataTypeID.SERIAL]: number;
    [DataTypeID.BIGSERIAL]: number | bigint | `${bigint}`;
    [DataTypeID.DATE]: ValidDate;
    [DataTypeID.TIMESTAMP]: ValidDate;
    [DataTypeID.TIME]: ValidDate;
    [DataTypeID.CHAR]: string;
    [DataTypeID.VARCHAR]: string;
    [DataTypeID.BYTECHAR]: string;
    [DataTypeID.BIT]: string;
    [DataTypeID.VARBIT]: string;
    [DataTypeID.TEXT]: string;
    [DataTypeID.ENUM]: string;
    [DataTypeID.UUID]: string | typeof GENERATE_UUID;
    [DataTypeID.BOOLEAN]: boolean;
    [DataTypeID.TSVECTOR]: null;
    [DataTypeID.JSON]: null;
    [DataTypeID.JSONB]: null;
    [DataTypeID.RECORD]: null;
}
export interface InputTypeMap extends Omit<MigrationTypeMap, DataTypeID.JSON> {
    [DataTypeID.JSON]: any;
    [DataTypeID.JSONB]: any;
    [DataTypeID.RECORD]: never;
    [DataTypeID.SETOF]: never;
    [DataTypeID.VOID]: void;
    [DataTypeID.TRIGGER]: never;
}
export interface OutputTypeMap extends Omit<InputTypeMap, DataTypeID.DATE | DataTypeID.TIMESTAMP | DataTypeID.TIME | DataTypeID.UUID> {
    [DataTypeID.BIGINT]: `${bigint}`;
    [DataTypeID.BIGSERIAL]: `${bigint}`;
    [DataTypeID.UUID]: string;
    [DataTypeID.DATE]: Date;
    [DataTypeID.TIMESTAMP]: Date;
    [DataTypeID.TIME]: Date;
}
export type ValidType = string | boolean | number | symbol | Date | RegExp | undefined | null | (string | boolean | number | symbol | Date | RegExp | undefined | null)[];
export declare const SYMBOL_COLUMNS: unique symbol;
export type MigrationTypeFromString<STR extends TypeString | OptionalTypeString> = STR extends "*" ? typeof SYMBOL_COLUMNS : ((STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE extends TypeString ? TYPE extends `${infer SUB_TYPE extends TypeString}[]` ? MigrationTypeMap[DataTypeFromString<SUB_TYPE>][] : MigrationTypeMap[DataTypeFromString<TYPE>] : never);
export type InputTypeFromString<STR extends TypeString | OptionalTypeString, VARS = {}> = STR extends "*" ? typeof SYMBOL_COLUMNS : ExpressionOr<VARS, ((STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE extends TypeString ? TYPE extends `${infer SUB_TYPE extends TypeString}[]` ? InputTypeMap[DataTypeFromString<SUB_TYPE>][] : InputTypeMap[DataTypeFromString<TYPE>] : never)>;
export type OutputTypeFromString<STR extends TypeString | OptionalTypeString> = STR extends "*" ? typeof SYMBOL_COLUMNS : (((STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE extends TypeString ? TYPE extends `${infer SUB_TYPE extends TypeString}[]` ? OutputTypeMap[DataTypeFromString<SUB_TYPE>][] : OutputTypeMap[DataTypeFromString<TYPE>] : never) extends infer OUTPUT_TYPE ? STR extends OptionalTypeString ? OUTPUT_TYPE | null : OUTPUT_TYPE : never);
export declare namespace TypeString {
    function resolve(typeString: TypeString | OptionalTypeString): string;
}
export type Initialiser<T, R = any> = (value: T) => R;
export type Key<OBJ, VALUE> = keyof {
    [KEY in keyof OBJ as OBJ[KEY] extends VALUE ? KEY : never]: VALUE;
};
export type EnumToTuple<ENUM, LENGTH extends 1[] = []> = Key<ENUM, LENGTH["length"]> extends infer KEY ? [
    KEY
] extends [never] ? [] : [KEY, ...EnumToTuple<ENUM, [...LENGTH, 1]>] : [];
export type Value<T> = T[keyof T];
export type SingleStringUnion<T> = ((k: ((T extends any ? () => T : never) extends infer U ? ((U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never) extends () => (infer R) ? R : never : never)) => any) extends (k: T) => any ? T : never;
export declare const CURRENT_TIMESTAMP: unique symbol;
export declare const DEPTH: unique symbol;
export declare const BREADTH: unique symbol;
export type SearchType = typeof DEPTH | typeof BREADTH;
export declare const ASC: unique symbol;
export declare const DESC: unique symbol;
export type SortDirection = typeof ASC | typeof DESC;
export declare const GENERATE_UUID: unique symbol;
export declare namespace StackUtil {
    interface CallSite extends NodeJS.CallSite {
        baseFormat: string;
        format(): string;
        isAsync(): boolean;
        getAbsoluteFileName(): string | null;
    }
    interface Stack extends Array<CallSite> {
        baseFormat: string;
        format(indent?: string): string;
    }
    function get(skip?: number): Stack;
    function getCallerFile(skip?: number): string | undefined;
}
