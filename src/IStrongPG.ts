export type Type = DataTypeID;

export enum DataTypeID {
	// numeric
	SMALLINT,
	INTEGER,
	BIGINT,
	NUMERIC,
	REAL,
	DOUBLE,
	SMALLSERIAL,
	SERIAL,
	BIGSERIAL,

	// datetime
	DATE,
	TIMESTAMP,
	TIME,
	// INTERVAL,

	// string
	CHAR,
	VARCHAR,
	BYTECHAR,
	BIT,
	VARBIT,
	TEXT,
	ENUM,

	// other
	BOOLEAN,

	// special
	TSVECTOR,
}

export interface typeStrings {
	// numeric
	[DataTypeID.SMALLINT]: "SMALLINT",
	[DataTypeID.INTEGER]: "INTEGER",
	[DataTypeID.BIGINT]: "BIGINT",
	[DataTypeID.NUMERIC]: "NUMERIC" | `NUMERIC(${bigint})` | `NUMERIC(${bigint},${bigint})`,
	[DataTypeID.REAL]: "REAL",
	[DataTypeID.DOUBLE]: "DOUBLE PRECISION",
	[DataTypeID.SMALLSERIAL]: "SMALLSERIAL",
	[DataTypeID.SERIAL]: "SERIAL",
	[DataTypeID.BIGSERIAL]: "BIGSERIAL",

	// datetime
	[DataTypeID.DATE]: "DATE",
	[DataTypeID.TIMESTAMP]: "TIMESTAMP" | `TIMESTAMP(${bigint})` | `TIMESTAMP(${bigint}) WITHOUT TIME ZONE`,
	[DataTypeID.TIME]: "TIME" | `TIME(${bigint})` | `TIME(${bigint}) WITHOUT TIME ZONE`,
	// idk how this one works and couldn't figure it out, so ignoring it
	// [DataType.INTERVAL]: `INTERVAL (${bigint})`,

	// string
	[DataTypeID.BYTECHAR]: "\"CHAR\"",
	[DataTypeID.CHAR]: "CHARACTER" | `CHARACTER(${bigint})`,
	[DataTypeID.VARCHAR]: "CHARACTER VARYING" | `CHARACTER VARYING(${bigint})`,
	[DataTypeID.BIT]: `BIT(${bigint})`,
	[DataTypeID.VARBIT]: "BIT VARYING" | `BIT VARYING(${bigint})`,
	[DataTypeID.TEXT]: "TEXT",
	[DataTypeID.ENUM]: `ENUM(${string})`,

	// other
	[DataTypeID.BOOLEAN]: "BOOLEAN",

	// special
	[DataTypeID.TSVECTOR]: "TSVECTOR",
}

export namespace DataType {
	// numeric
	export const SMALLINT: typeStrings[DataTypeID.SMALLINT] = "SMALLINT";
	export const INTEGER: typeStrings[DataTypeID.INTEGER] = "INTEGER";
	export const BIGINT: typeStrings[DataTypeID.BIGINT] = "BIGINT";
	export function NUMERIC (precision?: number, scale?: number) {
		return (precision === undefined ? "NUMERIC" as const
			: scale === undefined ? `NUMERIC(${Math.round(precision)})` as const
				: `NUMERIC(${Math.round(precision)},${Math.round(scale)})` as const) as typeStrings[DataTypeID.NUMERIC];
	}
	export const REAL: typeStrings[DataTypeID.REAL] = "REAL";
	export const DOUBLE: typeStrings[DataTypeID.DOUBLE] = "DOUBLE PRECISION";
	export const SMALLSERIAL: typeStrings[DataTypeID.SMALLSERIAL] = "SMALLSERIAL";
	export const SERIAL: typeStrings[DataTypeID.SERIAL] = "SERIAL";
	export const BIGSERIAL: typeStrings[DataTypeID.BIGSERIAL] = "BIGSERIAL";

	// datetime
	export const DATE = "DATE";
	export function TIMESTAMP (precision?: number, withoutTimeZone?: true) {
		const timeZone = withoutTimeZone ? " WITHOUT TIME ZONE" : "" as const;
		return (precision ? `TIMESTAMP(${Math.round(precision)})${timeZone}` : `TIMESTAMP${timeZone}`) as typeStrings[DataTypeID.TIMESTAMP];
	}
	export function TIME (precision?: number, withoutTimeZone?: true) {
		const timeZone = withoutTimeZone ? " WITHOUT TIME ZONE" : "" as const;
		return (precision ? `TIME(${Math.round(precision)})${timeZone}` : `TIME${timeZone}`) as typeStrings[DataTypeID.TIMESTAMP];
	}
	// INTERVAL,

	// string
	export const CHAR: typeStrings[DataTypeID.CHAR] = "CHARACTER";
	export function VARCHAR (length?: number): typeStrings[DataTypeID.VARCHAR] {
		return length === undefined ? "CHARACTER VARYING"
			: `CHARACTER VARYING(${Math.round(length)})` as typeStrings[DataTypeID.VARCHAR];
	}
	export const BYTECHAR: typeStrings[DataTypeID.BYTECHAR] = "\"CHAR\"";
	export function BIT (length: number) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		return `BIT(${Math.round(length)})` as string as typeStrings[DataTypeID.BIT];
	}
	export function VARBIT (length?: number) {
		return length === undefined ? "BIT VARYING"
			: `BIT VARYING(${Math.round(length)})` as typeStrings[DataTypeID.VARBIT];
	}
	export const TEXT: typeStrings[DataTypeID.TEXT] = "TEXT";
	export function ENUM<NAME extends string> (name: NAME) {
		return `ENUM(${name})` as Enum<NAME>;
	}

	export type Enum<NAME extends string> = `ENUM(${NAME})`;
	export type EnumName<ENUM_TYPE extends `ENUM(${string})`> = ENUM_TYPE extends `ENUM(${infer NAME})` ? NAME : never;

	// other
	export const BOOLEAN = "BOOLEAN";

	// special
	export const TSVECTOR = "TSVECTOR";
}

export type TypeString = typeStrings[DataTypeID];
export type TypeFromString<STR extends TypeString> = Extract<Value<{ [DATATYPE in DataTypeID as STR extends typeStrings[DATATYPE] ? DATATYPE : never]: DATATYPE }>, DataTypeID>;

export type Initialiser<T, R = any> = (value: T) => R;
// export type Merge2<L, R> = { [P in keyof L | keyof R]: L[P & keyof L] | R[P & keyof R] };
// export type Merge2<L, R> = L & R;
export type SetKey<OBJECT, KEY extends string, VALUE> = Omit<OBJECT, KEY> & { [key in KEY]: VALUE };

export type Key<OBJ, VALUE> = keyof { [KEY in keyof OBJ as OBJ[KEY] extends VALUE ? KEY : never]: VALUE };

export type EnumToTuple<ENUM, LENGTH extends 1[] = []> =
	Key<ENUM, LENGTH["length"]> extends infer KEY ?
	[KEY] extends [never] ? [] : [KEY, ...EnumToTuple<ENUM, [...LENGTH, 1]>] : [];

export type Value<T> = T[keyof T];
