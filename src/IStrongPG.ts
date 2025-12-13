import type { ExpressionOr } from './expressions/Expression'

export const CASCADE = Symbol('CASCADE')
export const SET_NULL = Symbol('SET NULL')
export const SET_DEFAULT = Symbol('SET DEFAULT')
export const NULLS_DISTINCT = Symbol('NULLS DISTINCT')
export const NULLS_NOT_DISTINCT = Symbol('NULLS NOT DISTINCT')
export type ForeignKeyOnDeleteAction = typeof CASCADE | typeof SET_NULL | typeof SET_DEFAULT

export type Type = DataTypeID

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
	UUID,

	// other
	BOOLEAN,

	// special
	TSVECTOR,
	JSON,
	JSONB,
	RECORD,
	SETOF,
	TRIGGER,
	VOID,
	ARRAY,
	ARRAYOF,
}

export interface TypeStringMap {
	// numeric
	[DataTypeID.SMALLINT]: 'SMALLINT'
	[DataTypeID.INTEGER]: 'INTEGER'
	[DataTypeID.BIGINT]: 'BIGINT'
	[DataTypeID.NUMERIC]: 'NUMERIC' | `NUMERIC(${bigint})` | `NUMERIC(${bigint},${bigint})`
	[DataTypeID.REAL]: 'REAL'
	[DataTypeID.DOUBLE]: 'DOUBLE PRECISION'
	[DataTypeID.SMALLSERIAL]: 'SMALLSERIAL'
	[DataTypeID.SERIAL]: 'SERIAL'
	[DataTypeID.BIGSERIAL]: 'BIGSERIAL'

	// datetime
	[DataTypeID.DATE]: 'DATE'
	[DataTypeID.TIMESTAMP]: 'TIMESTAMP' | `TIMESTAMP(${bigint})` | `TIMESTAMP(${bigint}) WITHOUT TIME ZONE`
	[DataTypeID.TIME]: 'TIME' | `TIME(${bigint})` | `TIME(${bigint}) WITHOUT TIME ZONE`
	// idk how this one works and couldn't figure it out, so ignoring it
	// [DataType.INTERVAL]: `INTERVAL (${bigint})`,

	// string
	[DataTypeID.BYTECHAR]: '"char"'
	[DataTypeID.CHAR]: 'CHARACTER' | `CHARACTER(${bigint})`
	[DataTypeID.VARCHAR]: 'CHARACTER VARYING' | `CHARACTER VARYING(${bigint})`
	[DataTypeID.BIT]: `BIT(${bigint})`
	[DataTypeID.VARBIT]: 'BIT VARYING' | `BIT VARYING(${bigint})`
	[DataTypeID.TEXT]: 'TEXT'
	[DataTypeID.ENUM]: `ENUM(${string})`

	// other
	[DataTypeID.BOOLEAN]: 'BOOLEAN'

	// special
	[DataTypeID.TSVECTOR]: 'TSVECTOR'
	[DataTypeID.JSON]: 'JSON'
	[DataTypeID.JSONB]: 'JSONB'
	[DataTypeID.UUID]: 'UUID'
	[DataTypeID.RECORD]: 'RECORD'
	[DataTypeID.SETOF]: `SETOF ${string}`
	[DataTypeID.TRIGGER]: 'TRIGGER'
	[DataTypeID.VOID]: 'VOID'
	[DataTypeID.ARRAY]: `${string}[]`
	[DataTypeID.ARRAYOF]: `${string}[]`
}

export namespace DataType {
	// numeric
	export const SMALLINT: TypeStringMap[DataTypeID.SMALLINT] = 'SMALLINT'
	export const INTEGER: TypeStringMap[DataTypeID.INTEGER] = 'INTEGER'
	export const BIGINT: TypeStringMap[DataTypeID.BIGINT] = 'BIGINT'
	export function NUMERIC (precision?: number, scale?: number) {
		return (precision === undefined ? 'NUMERIC' as const
			: scale === undefined ? `NUMERIC(${Math.round(precision)})` as const
				: `NUMERIC(${Math.round(precision)},${Math.round(scale)})` as const) as TypeStringMap[DataTypeID.NUMERIC]
	}
	export const REAL: TypeStringMap[DataTypeID.REAL] = 'REAL'
	export const DOUBLE: TypeStringMap[DataTypeID.DOUBLE] = 'DOUBLE PRECISION'
	export const SMALLSERIAL: TypeStringMap[DataTypeID.SMALLSERIAL] = 'SMALLSERIAL'
	export const SERIAL: TypeStringMap[DataTypeID.SERIAL] = 'SERIAL'
	export const BIGSERIAL: TypeStringMap[DataTypeID.BIGSERIAL] = 'BIGSERIAL'

	// datetime
	export const DATE = 'DATE'
	export function TIMESTAMP (precision?: number, withoutTimeZone?: true) {
		const timeZone = withoutTimeZone ? ' WITHOUT TIME ZONE' : '' as const
		return (precision ? `TIMESTAMP(${Math.round(precision)})${timeZone}` : `TIMESTAMP${timeZone}`) as TypeStringMap[DataTypeID.TIMESTAMP]
	}
	export function TIME (precision?: number, withoutTimeZone?: true) {
		const timeZone = withoutTimeZone ? ' WITHOUT TIME ZONE' : '' as const
		return (precision ? `TIME(${Math.round(precision)})${timeZone}` : `TIME${timeZone}`) as TypeStringMap[DataTypeID.TIMESTAMP]
	}
	// INTERVAL,

	// string
	export function CHAR (length?: number): TypeStringMap[DataTypeID.CHAR] {
		return length === undefined ? 'CHARACTER'
			: `CHARACTER(${Math.round(length)})` as TypeStringMap[DataTypeID.CHAR]
	}
	export function VARCHAR (length?: number): TypeStringMap[DataTypeID.VARCHAR] {
		return length === undefined ? 'CHARACTER VARYING'
			: `CHARACTER VARYING(${Math.round(length)})` as TypeStringMap[DataTypeID.VARCHAR]
	}
	export const BYTECHAR: TypeStringMap[DataTypeID.BYTECHAR] = '"char"'
	export function BIT (length: number) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		return `BIT(${Math.round(length)})` as string as TypeStringMap[DataTypeID.BIT]
	}
	export function VARBIT (length?: number) {
		return length === undefined ? 'BIT VARYING'
			: `BIT VARYING(${Math.round(length)})` as TypeStringMap[DataTypeID.VARBIT]
	}
	export const TEXT: TypeStringMap[DataTypeID.TEXT] = 'TEXT'
	export function ENUM<NAME extends string> (name: NAME): Enum<NAME> {
		return `ENUM(${name})` as const
	}

	export type Enum<NAME extends string> = `ENUM(${NAME})`
	export type EnumName<ENUM_TYPE extends `ENUM(${string})`> = ENUM_TYPE extends `ENUM(${infer NAME})` ? NAME : never
	export const UUID: TypeStringMap[DataTypeID.UUID] = 'UUID'

	// other
	export const BOOLEAN: TypeStringMap[DataTypeID.BOOLEAN] = 'BOOLEAN'

	// special
	export const TSVECTOR: TypeStringMap[DataTypeID.TSVECTOR] = 'TSVECTOR'
	export const JSON: TypeStringMap[DataTypeID.JSON] = 'JSON'
	export const JSONB: TypeStringMap[DataTypeID.JSONB] = 'JSONB'
	export const RECORD: TypeStringMap[DataTypeID.RECORD] = 'RECORD'
	export const TRIGGER: TypeStringMap[DataTypeID.TRIGGER] = 'TRIGGER'
	export const VOID: TypeStringMap[DataTypeID.VOID] = 'VOID'

	export function SETOF<TABLENAME extends string> (tablename: TABLENAME): `SETOF ${TABLENAME}` {
		return `SETOF ${tablename}` as const
	}

	export function ARRAY<TYPE extends TypeString> (type: TYPE): `${TYPE}[]` {
		return `${type}[]` as const
	}

	export function ARRAYOF<TABLENAME extends string> (type: TABLENAME): `${TABLENAME}[]` {
		return `${type}[]` as const
	}
}

export type TypeString = TypeStringMap[DataTypeID] | '*'

export interface OptionalTypeString<TYPE extends TypeString = TypeString> {
	type: TYPE
	optional: true
}

export type MakeOptional<TYPE> = TYPE extends TypeString ? OptionalTypeString<TYPE> : TYPE

export type ExtractTypeString<TYPE extends TypeString | OptionalTypeString> = TYPE extends OptionalTypeString<infer TYPE2> ? TYPE2 : TYPE

export type DataTypeFromString<STR extends TypeString | OptionalTypeString> =
	(STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE ? (
		TYPE extends `${TypeString}[]` ? {
			[DATATYPE in DataTypeID as TYPE extends TypeStringMap[DATATYPE] ? DATATYPE : never]: DATATYPE;
		}
		: TYPE extends `${string}[]` ? { [DataTypeID.ARRAYOF]: DataTypeID.ARRAYOF }
		: {
			[DATATYPE in DataTypeID as TYPE extends TypeStringMap[DATATYPE] ? DATATYPE : never]: DATATYPE;
		}
	) extends infer DATATYPE_RESULT ?
	DATATYPE_RESULT[keyof DATATYPE_RESULT] & DataTypeID
	: never
	: never

export type ValidDate = Date | number | typeof CURRENT_TIMESTAMP

export interface MigrationTypeMap {
	// numeric
	[DataTypeID.SMALLINT]: number
	[DataTypeID.INTEGER]: number
	[DataTypeID.BIGINT]: number | bigint | `${bigint}`
	[DataTypeID.NUMERIC]: number
	[DataTypeID.REAL]: number
	[DataTypeID.DOUBLE]: number
	[DataTypeID.SMALLSERIAL]: number
	[DataTypeID.SERIAL]: number
	[DataTypeID.BIGSERIAL]: number | bigint | `${bigint}`

	// datetime
	[DataTypeID.DATE]: ValidDate
	[DataTypeID.TIMESTAMP]: ValidDate
	[DataTypeID.TIME]: ValidDate
	// INTERVAL,

	// string
	[DataTypeID.CHAR]: string
	[DataTypeID.VARCHAR]: string
	[DataTypeID.BYTECHAR]: string
	[DataTypeID.BIT]: string
	[DataTypeID.VARBIT]: string
	[DataTypeID.TEXT]: string
	[DataTypeID.ENUM]: string
	[DataTypeID.UUID]: string | typeof GENERATE_UUID

	// other
	[DataTypeID.BOOLEAN]: boolean

	// special
	[DataTypeID.TSVECTOR]: null
	[DataTypeID.JSON]: null
	[DataTypeID.JSONB]: null
	[DataTypeID.RECORD]: null
}

export interface InputTypeMap extends Omit<MigrationTypeMap, DataTypeID.JSON | DataTypeID.JSONB> {
	[DataTypeID.JSON]: ValidLiteral | object
	[DataTypeID.JSONB]: ValidLiteral | object
	[DataTypeID.RECORD]: never
	[DataTypeID.SETOF]: never
	[DataTypeID.ARRAYOF]: any[]
	[DataTypeID.VOID]: void
	[DataTypeID.TRIGGER]: never
}

export interface OutputTypeMap extends Omit<InputTypeMap, DataTypeID.DATE | DataTypeID.TIMESTAMP | DataTypeID.TIME | DataTypeID.UUID | DataTypeID.JSON | DataTypeID.JSONB> {
	// numeric
	[DataTypeID.BIGINT]: `${bigint}`
	[DataTypeID.BIGSERIAL]: `${bigint}`

	// string
	[DataTypeID.UUID]: string

	[DataTypeID.JSON]: any
	[DataTypeID.JSONB]: any

	// datetime
	[DataTypeID.DATE]: Date
	[DataTypeID.TIMESTAMP]: Date
	[DataTypeID.TIME]: Date
	// INTERVAL,
}

export type ValidType =
	| ValidLiteral | symbol | Date | RegExp | undefined
	| (ValidLiteral | symbol | Date | RegExp | undefined)[]

export type ValidLiteral = string | boolean | number | null

export const SYMBOL_COLUMNS = Symbol('COLUMNS')

export type MigrationTypeFromString<STR extends TypeString | OptionalTypeString> = STR extends '*'
	? typeof SYMBOL_COLUMNS
	: (
		(STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE extends TypeString ?

		TYPE extends `${infer SUB_TYPE extends TypeString}[]`
		? MigrationTypeMap[DataTypeFromString<SUB_TYPE>][]
		: MigrationTypeMap[DataTypeFromString<TYPE>]

		: never
	)

export type InputTypeFromString<STR extends TypeString | OptionalTypeString, VARS = {}> = STR extends '*'
	? typeof SYMBOL_COLUMNS
	: ExpressionOr<VARS,
		| (
			(STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE extends TypeString ?

			TYPE extends `${infer SUB_TYPE extends TypeString}[]`
			? InputTypeMap[DataTypeFromString<SUB_TYPE>][]
			: InputTypeMap[DataTypeFromString<TYPE>]

			: never
		)
		| (STR extends OptionalTypeString<TypeString> ? null : never)
	>

export type OutputTypeFromString<STR extends TypeString | OptionalTypeString> = STR extends '*'
	? typeof SYMBOL_COLUMNS
	: (
		(
			(STR extends OptionalTypeString<infer TYPE> ? TYPE : STR) extends infer TYPE extends TypeString ?

			TYPE extends `${infer SUB_TYPE extends TypeString}[]`
			? OutputTypeMap[DataTypeFromString<SUB_TYPE>][]
			: OutputTypeMap[DataTypeFromString<TYPE>]

			: never
		) extends infer OUTPUT_TYPE ?
		STR extends OptionalTypeString ? OUTPUT_TYPE | null : OUTPUT_TYPE
		: never
	)

export namespace TypeString {
	export function resolve (typeString: TypeString | OptionalTypeString) {
		if (typeof typeString === 'object')
			typeString = typeString.type

		if (typeString.startsWith('ENUM('))
			return typeString.endsWith('[]')
				? `${typeString.slice(5, -3)}[]`
				: typeString.slice(5, -1)

		return typeString
	}
}

export type Initialiser<T, R = any> = (value: T) => R

export type Key<OBJ, VALUE> = keyof { [KEY in keyof OBJ as OBJ[KEY] extends VALUE ? KEY : never]: VALUE }

type Max<N extends number, A extends any[] = []> =
	[N] extends [Partial<A>['length']] ? A['length'] : Max<N, [0, ...A]>

export type EnumToTuple<ENUM, TUPLE extends any[] = [], LAST extends number = Max<ENUM[keyof ENUM] & number>> = TUPLE extends [any, ...infer TAIL] ? (TAIL['length'] extends LAST
	? TUPLE
	: EnumToTuple<ENUM, [...TUPLE, Key<ENUM, TUPLE['length']>]>
) : EnumToTuple<ENUM, [...TUPLE, Key<ENUM, TUPLE['length']>]>

export type Value<T> = T[keyof T]

export type SingleStringUnion<T> = ((k: ((T extends any ? () => T : never) extends infer U ? ((U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never) extends () => (infer R) ? R : never : never)) => any) extends (k: T) => any ? T : never

export const CURRENT_TIMESTAMP = Symbol('CURRENT_TIMESTAMP AT TIME ZONE \'UTC\'')
export const DEPTH = Symbol('DEPTH')
export const BREADTH = Symbol('BREADTH')
export type SearchType = typeof DEPTH | typeof BREADTH
export const ASC = Symbol('ASC')
export const DESC = Symbol('DESC')
export type SortDirection = typeof ASC | typeof DESC
export const GENERATE_UUID = Symbol('gen_random_uuid()')

let ansicolor: typeof import('ansicolor') | undefined
function color (color: keyof typeof import('ansicolor'), text: string) {
	if (!ansicolor) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			ansicolor = require('ansicolor')
		}
		catch { }

		if (!ansicolor)
			return text
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	return (ansicolor as any)[color](text) as string
}

export namespace StackUtil {

	export interface CallSite extends NodeJS.CallSite {
		baseFormat: string
		format (): string
		isAsync (): boolean
		getAbsoluteFileName (): string | null
	}

	export interface Stack extends Array<CallSite> {
		baseFormat: string
		format (indent?: string): string
	}

	export function get (skip = 0) {
		skip += 2

		const originalFunc = Error.prepareStackTrace

		// capture stack trace
		Error.prepareStackTrace = function (err, stack) { return stack }
		const err = new Error()
		const stack = err.stack as any as Stack
		Error.prepareStackTrace = originalFunc

		stack.baseFormat = new Error().stack!

		const lines = stack.baseFormat.split('\n')
		for (let i = 1; i < lines.length; i++)
			stack[i - 1].baseFormat = lines[i].trimStart()

		let currentSite = stack.shift()

		while (stack.length) {
			const callerSite = stack.shift()
			if (currentSite?.getFileName() !== callerSite?.getFileName()) {
				skip--
				currentSite = callerSite
				if (skip <= 0) {
					if (callerSite)
						stack.unshift(callerSite)
					break
				}
			}
		}

		for (const callSite of stack) {
			callSite.getAbsoluteFileName = callSite.getFileName as () => string | null

			Object.defineProperty(callSite, 'getFileName', {
				value () {
					const basenameRegex = /(?<=\()[^)]+(?=:\d+:\d+\))/
					const originalFile = callSite.baseFormat.match(basenameRegex)?.[0]

					let callerFile = originalFile ?? callSite.getAbsoluteFileName() ?? undefined

					if (callerFile?.startsWith('internal/'))
						return callerFile

					let path: typeof import('path') | undefined
					try {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						path = require('path')
						callerFile = callerFile && path?.relative(process.env.DEBUG_PG_ROOT_DIR || process.cwd(), callerFile)
					}
					catch { }

					return callerFile ?? null
				},
			})

			const originalGetLineNumber = callSite.getLineNumber
			Object.defineProperty(callSite, 'getLineNumber', {
				value () {
					const lineNumberRegex = /(?<=[(\\/][^\\/)]+:)\d+(?=[):])/
					const baseLineNumber = callSite.baseFormat.match(lineNumberRegex)?.[0]
					const result = +(baseLineNumber ?? originalGetLineNumber.call(callSite) ?? -1)
					return result === -1 ? undefined : result
				},
			})

			const originalGetColumnNumber = callSite.getColumnNumber
			Object.defineProperty(callSite, 'getColumnNumber', {
				value () {
					const columnNumberRegex = /(?<=[(\\/][^\\/)]+:\d+:)\d+(?=\))/
					const baseColumnNumber = callSite.baseFormat.match(columnNumberRegex)?.[0]
					const result = +(baseColumnNumber ?? originalGetColumnNumber.call(callSite) ?? -1)
					return result === -1 ? undefined : result
				},
			})

			callSite.format = () => {
				const typeName = callSite.getTypeName()
				const methodName = callSite.getMethodName()
				const functionName = callSite.getFunctionName()
				const callName = methodName ?? functionName ?? '<anonymous>'
				let qualifiedCallName = typeName && (methodName || !functionName) ? `${typeName}.${callName}` : callName

				if (typeName && functionName && methodName && methodName !== functionName && !functionName.startsWith(typeName))
					qualifiedCallName = `${typeName}.${functionName}${functionName.endsWith(methodName) ? '' : color('darkGray', ` [as ${color('lightGray', methodName)}]`)}`

				const asyncModifier = callSite.isAsync() ? 'async ' : ''
				const constructorModifier = callSite.isConstructor() ? 'new ' : ''
				const evalModifier = callSite.isEval() ? color('lightRed', 'eval ') : ''

				const fileName = callSite.getFileName()
				const lineNumber = callSite.getLineNumber()
				const columnNumber = callSite.getColumnNumber()

				const location = color('lightBlue', fileName ? `${fileName}:${lineNumber!}:${columnNumber!}` : '<anonymous>')

				return `${evalModifier}${color('darkGray', 'at')} ${asyncModifier}${constructorModifier}${qualifiedCallName} ${color('darkGray', `(${location})`)}`
			}
		}

		stack.format = (indent = '    ') => stack
			.map(callSite => `${indent}${callSite.format()}`)
			.join('\n')

		return stack
	}

	export function getCallerFile (skip?: number) {
		return get(skip)?.[0].getFileName() ?? undefined
	}
}
