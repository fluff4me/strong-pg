/// <reference types="node" />
import { ExpressionOr } from "./expressions/Expression";
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
    BOOLEAN = 19,
    TSVECTOR = 20,
    JSON = 21
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
    [DataTypeID.BYTECHAR]: "\"CHAR\"";
    [DataTypeID.CHAR]: "CHARACTER" | `CHARACTER(${bigint})`;
    [DataTypeID.VARCHAR]: "CHARACTER VARYING" | `CHARACTER VARYING(${bigint})`;
    [DataTypeID.BIT]: `BIT(${bigint})`;
    [DataTypeID.VARBIT]: "BIT VARYING" | `BIT VARYING(${bigint})`;
    [DataTypeID.TEXT]: "TEXT";
    [DataTypeID.ENUM]: `ENUM(${string})`;
    [DataTypeID.BOOLEAN]: "BOOLEAN";
    [DataTypeID.TSVECTOR]: "TSVECTOR";
    [DataTypeID.JSON]: "JSON";
}
export declare namespace DataType {
    const SMALLINT: TypeStringMap[DataTypeID.SMALLINT];
    const INTEGER: TypeStringMap[DataTypeID.INTEGER];
    const BIGINT: TypeStringMap[DataTypeID.BIGINT];
    function NUMERIC(precision?: number, scale?: number): "NUMERIC" | `NUMERIC(${bigint})` | `NUMERIC(${bigint},${bigint})`;
    const REAL: TypeStringMap[DataTypeID.REAL];
    const DOUBLE: TypeStringMap[DataTypeID.DOUBLE];
    const SMALLSERIAL: TypeStringMap[DataTypeID.SMALLSERIAL];
    const SERIAL: TypeStringMap[DataTypeID.SERIAL];
    const BIGSERIAL: TypeStringMap[DataTypeID.BIGSERIAL];
    const DATE = "DATE";
    function TIMESTAMP(precision?: number, withoutTimeZone?: true): "TIMESTAMP" | `TIMESTAMP(${bigint})` | `TIMESTAMP(${bigint}) WITHOUT TIME ZONE`;
    function TIME(precision?: number, withoutTimeZone?: true): "TIMESTAMP" | `TIMESTAMP(${bigint})` | `TIMESTAMP(${bigint}) WITHOUT TIME ZONE`;
    const CHAR: TypeStringMap[DataTypeID.CHAR];
    function VARCHAR(length?: number): TypeStringMap[DataTypeID.VARCHAR];
    const BYTECHAR: TypeStringMap[DataTypeID.BYTECHAR];
    function BIT(length: number): `BIT(${bigint})`;
    function VARBIT(length?: number): "BIT VARYING" | `BIT VARYING(${bigint})`;
    const TEXT: TypeStringMap[DataTypeID.TEXT];
    function ENUM<NAME extends string>(name: NAME): Enum<NAME>;
    type Enum<NAME extends string> = `ENUM(${NAME})`;
    type EnumName<ENUM_TYPE extends `ENUM(${string})`> = ENUM_TYPE extends `ENUM(${infer NAME})` ? NAME : never;
    const BOOLEAN: TypeStringMap[DataTypeID.BOOLEAN];
    const TSVECTOR: TypeStringMap[DataTypeID.TSVECTOR];
    const JSON: TypeStringMap[DataTypeID.JSON];
}
export type TypeString = TypeStringMap[DataTypeID] | "*";
export type DataTypeFromString<STR extends TypeString> = {
    [DATATYPE in DataTypeID as STR extends TypeStringMap[DATATYPE] ? DATATYPE : never]: DATATYPE;
} extends infer DATATYPE_RESULT ? DATATYPE_RESULT[keyof DATATYPE_RESULT] & DataTypeID : never;
export type ValidDate = Date | number | typeof Keyword.CurrentTimestamp;
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
    [DataTypeID.BOOLEAN]: boolean;
    [DataTypeID.TSVECTOR]: null;
    [DataTypeID.JSON]: null;
}
export interface InputTypeMap extends Omit<MigrationTypeMap, DataTypeID.JSON> {
    [DataTypeID.JSON]: any;
}
export interface OutputTypeMap extends Omit<InputTypeMap, DataTypeID.DATE | DataTypeID.TIMESTAMP | DataTypeID.TIME> {
    [DataTypeID.DATE]: Date;
    [DataTypeID.TIMESTAMP]: Date;
    [DataTypeID.TIME]: Date;
}
export type ValidType = string | boolean | number | symbol | Date | RegExp | undefined | null;
export declare const SYMBOL_COLUMNS: unique symbol;
export type MigrationTypeFromString<STR extends TypeString> = STR extends "*" ? typeof SYMBOL_COLUMNS : MigrationTypeMap[DataTypeFromString<STR>];
export type InputTypeFromString<STR extends TypeString, VARS = {}> = STR extends "*" ? typeof SYMBOL_COLUMNS : ExpressionOr<VARS, InputTypeMap[DataTypeFromString<STR>]>;
export type OutputTypeFromString<STR extends TypeString> = STR extends "*" ? typeof SYMBOL_COLUMNS : OutputTypeMap[DataTypeFromString<STR>];
export declare namespace TypeString {
    function resolve(typeString: TypeString): string;
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
export declare namespace Keyword {
    const CurrentTimestamp: unique symbol;
}
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
