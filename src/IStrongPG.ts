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
	JSON,
}

export interface TypeStringMap {
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
	[DataTypeID.JSON]: "JSON",
}

export namespace DataType {
	// numeric
	export const SMALLINT: TypeStringMap[DataTypeID.SMALLINT] = "SMALLINT";
	export const INTEGER: TypeStringMap[DataTypeID.INTEGER] = "INTEGER";
	export const BIGINT: TypeStringMap[DataTypeID.BIGINT] = "BIGINT";
	export function NUMERIC (precision?: number, scale?: number) {
		return (precision === undefined ? "NUMERIC" as const
			: scale === undefined ? `NUMERIC(${Math.round(precision)})` as const
				: `NUMERIC(${Math.round(precision)},${Math.round(scale)})` as const) as TypeStringMap[DataTypeID.NUMERIC];
	}
	export const REAL: TypeStringMap[DataTypeID.REAL] = "REAL";
	export const DOUBLE: TypeStringMap[DataTypeID.DOUBLE] = "DOUBLE PRECISION";
	export const SMALLSERIAL: TypeStringMap[DataTypeID.SMALLSERIAL] = "SMALLSERIAL";
	export const SERIAL: TypeStringMap[DataTypeID.SERIAL] = "SERIAL";
	export const BIGSERIAL: TypeStringMap[DataTypeID.BIGSERIAL] = "BIGSERIAL";

	// datetime
	export const DATE = "DATE";
	export function TIMESTAMP (precision?: number, withoutTimeZone?: true) {
		const timeZone = withoutTimeZone ? " WITHOUT TIME ZONE" : "" as const;
		return (precision ? `TIMESTAMP(${Math.round(precision)})${timeZone}` : `TIMESTAMP${timeZone}`) as TypeStringMap[DataTypeID.TIMESTAMP];
	}
	export function TIME (precision?: number, withoutTimeZone?: true) {
		const timeZone = withoutTimeZone ? " WITHOUT TIME ZONE" : "" as const;
		return (precision ? `TIME(${Math.round(precision)})${timeZone}` : `TIME${timeZone}`) as TypeStringMap[DataTypeID.TIMESTAMP];
	}
	// INTERVAL,

	// string
	export const CHAR: TypeStringMap[DataTypeID.CHAR] = "CHARACTER";
	export function VARCHAR (length?: number): TypeStringMap[DataTypeID.VARCHAR] {
		return length === undefined ? "CHARACTER VARYING"
			: `CHARACTER VARYING(${Math.round(length)})` as TypeStringMap[DataTypeID.VARCHAR];
	}
	export const BYTECHAR: TypeStringMap[DataTypeID.BYTECHAR] = "\"CHAR\"";
	export function BIT (length: number) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		return `BIT(${Math.round(length)})` as string as TypeStringMap[DataTypeID.BIT];
	}
	export function VARBIT (length?: number) {
		return length === undefined ? "BIT VARYING"
			: `BIT VARYING(${Math.round(length)})` as TypeStringMap[DataTypeID.VARBIT];
	}
	export const TEXT: TypeStringMap[DataTypeID.TEXT] = "TEXT";
	export function ENUM<NAME extends string> (name: NAME): Enum<NAME> {
		return `ENUM(${name})` as const;
	}

	export type Enum<NAME extends string> = `ENUM(${NAME})`;
	export type EnumName<ENUM_TYPE extends `ENUM(${string})`> = ENUM_TYPE extends `ENUM(${infer NAME})` ? NAME : never;

	// other
	export const BOOLEAN: TypeStringMap[DataTypeID.BOOLEAN] = "BOOLEAN";

	// special
	export const TSVECTOR: TypeStringMap[DataTypeID.TSVECTOR] = "TSVECTOR";
	export const JSON: TypeStringMap[DataTypeID.JSON] = "JSON";
}

export type TypeString = TypeStringMap[DataTypeID] | "*";

export type DataTypeFromString<STR extends TypeString> =
	{ [DATATYPE in DataTypeID as STR extends TypeStringMap[DATATYPE] ? DATATYPE : never]: DATATYPE } extends infer DATATYPE_RESULT ?
	DATATYPE_RESULT[keyof DATATYPE_RESULT] & DataTypeID
	: never;

export type ValidDate = Date | number | typeof Keyword.CurrentTimestamp;

export interface TypeMap {
	// numeric
	[DataTypeID.SMALLINT]: number;
	[DataTypeID.INTEGER]: number;
	[DataTypeID.BIGINT]: number;
	[DataTypeID.NUMERIC]: number;
	[DataTypeID.REAL]: number;
	[DataTypeID.DOUBLE]: number;
	[DataTypeID.SMALLSERIAL]: number;
	[DataTypeID.SERIAL]: number;
	[DataTypeID.BIGSERIAL]: number;

	// datetime
	[DataTypeID.DATE]: ValidDate;
	[DataTypeID.TIMESTAMP]: ValidDate;
	[DataTypeID.TIME]: ValidDate;
	// INTERVAL,

	// string
	[DataTypeID.CHAR]: string;
	[DataTypeID.VARCHAR]: string;
	[DataTypeID.BYTECHAR]: string;
	[DataTypeID.BIT]: string;
	[DataTypeID.VARBIT]: string;
	[DataTypeID.TEXT]: string;
	[DataTypeID.ENUM]: string;

	// other
	[DataTypeID.BOOLEAN]: boolean;

	// special
	[DataTypeID.TSVECTOR]: null;
	[DataTypeID.JSON]: null;
}

export type ValidType = string | boolean | number | symbol | Date | RegExp | undefined | null;

export const SYMBOL_COLUMNS = Symbol("COLUMNS");
export type TypeFromString<STR extends TypeString> = STR extends "*" ? typeof SYMBOL_COLUMNS : TypeMap[DataTypeFromString<STR>];

export namespace TypeString {
	export function resolve (typeString: TypeString) {
		if (typeString.startsWith("ENUM("))
			return typeString.slice(5, -1);

		return typeString;
	}
}

export type Initialiser<T, R = any> = (value: T) => R;
// export type Merge2<L, R> = { [P in keyof L | keyof R]: L[P & keyof L] | R[P & keyof R] };
// export type Merge2<L, R> = L & R;
export type SetKey<OBJECT, KEY extends string, VALUE> = Omit<OBJECT, KEY> & { [key in KEY]: VALUE };

export type Key<OBJ, VALUE> = keyof { [KEY in keyof OBJ as OBJ[KEY] extends VALUE ? KEY : never]: VALUE };

export type EnumToTuple<ENUM, LENGTH extends 1[] = []> =
	Key<ENUM, LENGTH["length"]> extends infer KEY ?
	[KEY] extends [never] ? [] : [KEY, ...EnumToTuple<ENUM, [...LENGTH, 1]>] : [];

export type Value<T> = T[keyof T];

export namespace Keyword {
	export const CurrentTimestamp = Symbol("CURRENT_TIMESTAMP");
}

let ansicolor: typeof import("ansicolor") | undefined;
function color (color: keyof typeof import("ansicolor"), text: string) {
	if (!ansicolor) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			ansicolor = require("ansicolor");
			// eslint-disable-next-line no-empty
		} catch { }

		if (!ansicolor)
			return text;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	return (ansicolor as any)[color](text) as string;
}

export namespace StackUtil {

	export interface CallSite extends NodeJS.CallSite {
		baseFormat: string;
		format (): string;
		isAsync (): boolean;
		getAbsoluteFileName (): string | null;
	}

	export interface Stack extends Array<CallSite> {
		baseFormat: string;
		format (indent?: string): string;
	}

	export function get (skip = 0) {
		skip += 2;

		const originalFunc = Error.prepareStackTrace;

		// capture stack trace
		Error.prepareStackTrace = function (err, stack) { return stack; };
		const err = new Error();
		const stack = err.stack as any as Stack;
		Error.prepareStackTrace = originalFunc;

		stack.baseFormat = new Error().stack!;

		const lines = stack.baseFormat.split("\n");
		for (let i = 1; i < lines.length; i++)
			stack[i - 1].baseFormat = lines[i].trimStart();

		let currentSite = stack.shift();

		while (stack.length) {
			const callerSite = stack.shift();
			if (currentSite?.getFileName() !== callerSite?.getFileName()) {
				skip--;
				currentSite = callerSite;
				if (skip <= 0) {
					if (callerSite)
						stack.unshift(callerSite);
					break;
				}
			}
		}

		for (const callSite of stack) {
			callSite.getAbsoluteFileName = callSite.getFileName;

			Object.defineProperty(callSite, "getFileName", {
				value () {
					const basenameRegex = /(?<=\()[^)]+(?=:\d+:\d+\))/;
					const originalFile = callSite.baseFormat.match(basenameRegex)?.[0];

					let callerFile = originalFile ?? callSite.getAbsoluteFileName() ?? undefined;

					if (callerFile?.startsWith("internal/"))
						return callerFile;

					// eslint-disable-next-line @typescript-eslint/no-var-requires 
					let path: typeof import("path") | undefined;
					try {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						path = require("path");
						callerFile = callerFile && path?.relative(process.env.DEBUG_PG_ROOT_DIR || process.cwd(), callerFile);
						// eslint-disable-next-line no-empty
					} catch { }

					return callerFile ?? null;
				},
			});

			const originalGetLineNumber = callSite.getLineNumber;
			Object.defineProperty(callSite, "getLineNumber", {
				value () {
					const lineNumberRegex = /(?<=[(\\/][^\\/)]+:)\d+(?=[):])/;
					const baseLineNumber = callSite.baseFormat.match(lineNumberRegex)?.[0];
					const result = +(baseLineNumber ?? originalGetLineNumber.call(callSite) ?? -1);
					return result === -1 ? undefined : result;
				},
			});

			const originalGetColumnNumber = callSite.getColumnNumber;
			Object.defineProperty(callSite, "getColumnNumber", {
				value () {
					const columnNumberRegex = /(?<=[(\\/][^\\/)]+:\d+:)\d+(?=\))/;
					const baseColumnNumber = callSite.baseFormat.match(columnNumberRegex)?.[0];
					const result = +(baseColumnNumber ?? originalGetColumnNumber.call(callSite) ?? -1);
					return result === -1 ? undefined : result;
				},
			});

			callSite.format = () => {
				const typeName = callSite.getTypeName();
				const methodName = callSite.getMethodName();
				const functionName = callSite.getFunctionName();
				const callName = methodName ?? functionName ?? "<anonymous>";
				let qualifiedCallName = typeName && (methodName || !functionName) ? `${typeName}.${callName}` : callName;

				if (typeName && functionName && methodName && methodName !== functionName && !functionName.startsWith(typeName))
					qualifiedCallName = `${typeName}.${functionName}${functionName.endsWith(methodName) ? "" : color("darkGray", ` [as ${color("lightGray", methodName)}]`)}`;

				const asyncModifier = callSite.isAsync() ? "async " : "";
				const constructorModifier = callSite.isConstructor() ? "new " : "";
				const evalModifier = callSite.isEval() ? color("lightRed", "eval ") : "";

				const fileName = callSite.getFileName();
				const lineNumber = callSite.getLineNumber();
				const columnNumber = callSite.getColumnNumber();

				const location = color("lightBlue", fileName ? `${fileName}:${lineNumber!}:${columnNumber!}` : "<anonymous>");

				return `${evalModifier}${color("darkGray", "at")} ${asyncModifier}${constructorModifier}${qualifiedCallName} ${color("darkGray", `(${location})`)}`;
			};
		}

		stack.format = (indent = "    ") => stack
			.map(callSite => `${indent}${callSite.format()}`)
			.join("\n");

		return stack;
	}

	export function getCallerFile (skip?: number) {
		return get(skip)?.[0].getFileName() ?? undefined;
	}
}
