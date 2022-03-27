export declare type Type = DataTypeID;
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
    TSVECTOR = 20
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
    function VARBIT(length?: number): `BIT VARYING(${bigint})` | "BIT VARYING";
    const TEXT: TypeStringMap[DataTypeID.TEXT];
    function ENUM<NAME extends string>(name: NAME): Enum<NAME>;
    type Enum<NAME extends string> = `ENUM(${NAME})`;
    type EnumName<ENUM_TYPE extends `ENUM(${string})`> = ENUM_TYPE extends `ENUM(${infer NAME})` ? NAME : never;
    const BOOLEAN = "BOOLEAN";
    const TSVECTOR = "TSVECTOR";
}
export declare type TypeString = TypeStringMap[DataTypeID] | "*";
export declare type DataTypeFromString<STR extends TypeString> = {
    [DATATYPE in DataTypeID as STR extends TypeStringMap[DATATYPE] ? DATATYPE : never]: DATATYPE;
} extends infer DATATYPE_RESULT ? DATATYPE_RESULT[keyof DATATYPE_RESULT] & DataTypeID : never;
export declare type ValidDate = Date | number | typeof Keyword.CurrentTimestamp;
export interface TypeMap {
    [DataTypeID.SMALLINT]: number;
    [DataTypeID.INTEGER]: number;
    [DataTypeID.BIGINT]: number;
    [DataTypeID.NUMERIC]: number;
    [DataTypeID.REAL]: number;
    [DataTypeID.DOUBLE]: number;
    [DataTypeID.SMALLSERIAL]: number;
    [DataTypeID.SERIAL]: number;
    [DataTypeID.BIGSERIAL]: number;
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
}
export declare type ValidType = string | boolean | number | symbol | Date | undefined | null;
export declare const SYMBOL_COLUMNS: unique symbol;
export declare type TypeFromString<STR extends TypeString> = STR extends "*" ? typeof SYMBOL_COLUMNS : TypeMap[DataTypeFromString<STR>];
export declare namespace TypeString {
    function resolve(typeString: TypeString): string;
}
export declare type Initialiser<T, R = any> = (value: T) => R;
export declare type SetKey<OBJECT, KEY extends string, VALUE> = Omit<OBJECT, KEY> & {
    [key in KEY]: VALUE;
};
export declare type Key<OBJ, VALUE> = keyof {
    [KEY in keyof OBJ as OBJ[KEY] extends VALUE ? KEY : never]: VALUE;
};
export declare type EnumToTuple<ENUM, LENGTH extends 1[] = []> = Key<ENUM, LENGTH["length"]> extends infer KEY ? [
    KEY
] extends [never] ? [] : [KEY, ...EnumToTuple<ENUM, [...LENGTH, 1]>] : [];
export declare type Value<T> = T[keyof T];
export declare namespace Keyword {
    const CurrentTimestamp: unique symbol;
}
