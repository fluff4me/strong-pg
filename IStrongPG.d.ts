import { Client, Pool as PGPool, PoolClient } from "pg";
export declare type ClientOrPool = Client | PGPool | PoolClient;
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
    BOOLEAN = 18,
    TSVECTOR = 19
}
export interface typeStrings {
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
    [DataTypeID.BOOLEAN]: "BOOLEAN";
    [DataTypeID.TSVECTOR]: "TSVECTOR";
}
export declare namespace DataType {
    const SMALLINT: typeStrings[DataTypeID.SMALLINT];
    const INTEGER: typeStrings[DataTypeID.INTEGER];
    const BIGINT: typeStrings[DataTypeID.BIGINT];
    function NUMERIC(precision?: number, scale?: number): "NUMERIC" | `NUMERIC(${bigint})` | `NUMERIC(${bigint},${bigint})`;
    const REAL: typeStrings[DataTypeID.REAL];
    const DOUBLE: typeStrings[DataTypeID.DOUBLE];
    const SMALLSERIAL: typeStrings[DataTypeID.SMALLSERIAL];
    const SERIAL: typeStrings[DataTypeID.SERIAL];
    const BIGSERIAL: typeStrings[DataTypeID.BIGSERIAL];
    const DATE = "DATE";
    function TIMESTAMP(precision?: number, withoutTimeZone?: true): string;
    function TIME(precision?: number, withoutTimeZone?: true): string;
    const CHAR: typeStrings[DataTypeID.CHAR];
    function VARCHAR(length?: number): typeStrings[DataTypeID.VARCHAR];
    const BYTECHAR: typeStrings[DataTypeID.BYTECHAR];
    function BIT(length: number): `BIT(${bigint})`;
    function VARBIT(length?: number): `BIT VARYING(${bigint})` | "BIT VARYING";
    const TEXT: typeStrings[DataTypeID.TEXT];
    const BOOLEAN = "BOOLEAN";
    const TSVECTOR = "TSVECTOR";
}
export declare type TypeString = typeStrings[DataTypeID];
export declare type TypeFromString<STR extends TypeString> = Extract<Value<{
    [DATATYPE in DataTypeID as STR extends typeStrings[DATATYPE] ? DATATYPE : never]: DATATYPE;
}>, DataTypeID>;
export declare type Initialiser<T> = (value: T) => any;
export declare type Merge2<L, R> = {
    [P in keyof L | keyof R]: L[P & keyof L] | R[P & keyof R];
};
export declare type ReplaceKey<OBJECT, KEY extends keyof OBJECT, VALUE> = Merge2<Pick<OBJECT, Exclude<keyof OBJECT, KEY>>, {
    [key in KEY]: VALUE;
}>;
export declare type Value<T> = T[keyof T];
