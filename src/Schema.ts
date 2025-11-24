import { DataTypeID, EnumToTuple, InputTypeFromString, OptionalTypeString, OutputTypeFromString, TypeString, TypeStringMap } from "./IStrongPG";
import sql from "./sql";

interface SpecialKeys<SCHEMA> {
	PRIMARY_KEY?: keyof SCHEMA | (keyof SCHEMA)[];
}

type SchemaBase = Record<string, TypeString | OptionalTypeString>;

// type Schema<SCHEMA extends SchemaBase = SchemaBase> = { PRIMARY_KEY?: keyof SCHEMA } & SCHEMA;

export type TableSchema = Record<string, any>;

export interface DatabaseSchema {
	tables: Record<string, TableSchema>;
	indices: Record<string, {}>;
	enums: Record<string, string[]>;
	triggers: Record<string, {}>;
	functions: Record<string, FunctionSchema>;
	collations: Record<string, {}>;
	types: Record<string, TableSchema>;
}

export interface FunctionSchema<VERSION extends string = string, IN extends [(TypeString | OptionalTypeString), string][] = [(TypeString | OptionalTypeString), string][], OUT extends [TypeString, string][] = [TypeString, string][], RETURN extends TypeString = TypeString> {
	readonly version: VERSION;
	readonly in: IN;
	readonly out: OUT;
	readonly return: RETURN;
	readonly sql?: sql;
	readonly declarations?: Record<string, TypeString>;
	readonly plpgsql?: sql;
}

export type FunctionParameters<SCHEMA extends FunctionSchema> = SCHEMA extends FunctionSchema<string, infer IN, any, any> ? { [I in keyof IN]: InputTypeFromString<IN[I][0]> | (IN[I] extends OptionalTypeString ? null | undefined : never) } : never;

export namespace DatabaseSchema {
	export interface Empty {
		tables: {};
		indices: {};
		enums: {};
		triggers: {};
		functions: {};
		collations: {};
		types: {};
	}

	export type TableName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["tables"] & string;
	export type IndexName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["indices"] & string;
	export type EnumName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["enums"] & string;
	export type TriggerName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["triggers"] & string;
	export type FunctionName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["functions"] & string;
	export type CollationName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["collations"] & string;
	export type TypeName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["types"] & string;

	export type Table<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> =
		SCHEMA["tables"][NAME] extends infer TABLE ? TABLE extends TableSchema ? TABLE : never : never;

	export type Type<SCHEMA extends DatabaseSchema, NAME extends TypeName<SCHEMA>> =
		SCHEMA["types"][NAME] extends infer TYPE ? TYPE extends TableSchema ? TYPE : never : never;

	export type Function<SCHEMA extends DatabaseSchema, NAME extends FunctionName<SCHEMA>> =
		SCHEMA["functions"][NAME] extends infer FUNCTION extends FunctionSchema<infer IN, infer OUT, infer RETURN> ? FUNCTION : never;

	export type Enum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> =
		SCHEMA["enums"][NAME] extends infer ENUM ? ENUM extends string[] ? ENUM : never : never;
}

// this is a type function that validates the schema it receives
type ValidateTableSchema<SCHEMA> =
	// type variables
	SpecialKeys<SCHEMA> extends infer SPECIAL_DATA ? // 
	keyof SPECIAL_DATA extends infer SPECIAL_KEYS ?
	Exclude<keyof SCHEMA, SPECIAL_KEYS> extends infer KEYS ?
	Pick<SCHEMA, KEYS & keyof SCHEMA> extends infer SCHEMA_CORE ?
	Pick<SCHEMA, SPECIAL_KEYS & keyof SCHEMA> extends infer SCHEMA_SPECIAL ?

	// the actual validation
	SCHEMA_CORE extends SchemaBase ?
	SCHEMA_SPECIAL extends SPECIAL_DATA ? SCHEMA : "Unknown or invalid special keys in schema"
	: "Invalid column types"

	: never : never : never : never : never;

// this is a type function that validates the schema it receives

type ValidateDatabaseSchema<SCHEMA extends DatabaseSchema> =
	ValidateDatabaseSchemaEnumTableColumns<SCHEMA> extends infer RESULT ?
	Extract<RESULT, string> extends infer ERRORS ?

	[ERRORS] extends [never] ? SCHEMA : ERRORS

	: never : never;

type ValidateDatabaseSchemaEnumTableColumns<SCHEMA extends DatabaseSchema> =
	// vars
	SCHEMA["tables"] extends { [key: string]: { [key: string]: infer ENUM_TABLE_COLUMNS } } ?
	Extract<ENUM_TABLE_COLUMNS, `ENUM(${string})`> extends infer ENUMS ?

	// if there's no enum table columns, pass
	[ENUMS] extends [never] ? SCHEMA :

	// extract actual enum names
	Extract<ENUM_TABLE_COLUMNS, `ENUM(${string})`> extends `ENUM(${infer ENUM})` ?

	// error if the enum names don't exist in the database
	ENUM extends keyof SCHEMA["enums"] ? SCHEMA : `Enum ${ENUM} does not exist in the database`

	: never : never : never;

export interface SchemaEnum<ENUM> {
	VALUES: ENUM;
	sql: { [KEY in keyof ENUM as ENUM[KEY] & string]: sql };
	setName (name: string): this;
}

export interface SchemaLegacyFunctionFactory<IN extends (TypeString | OptionalTypeString)[], OUT extends [TypeString, string][] = [], RETURNS extends TypeString = "VOID"> {
	out<TYPE extends TypeString, NAME extends string> (type: TYPE, name: NAME): SchemaLegacyFunctionFactory<IN, [...OUT, [TYPE, NAME]]>
	returns<TYPE extends TypeString> (returns: TYPE): SchemaLegacyFunctionFactory<IN, OUT, TYPE>
	get (): FunctionSchema<"-1", { [I in keyof IN]: [IN[I], string] }, OUT, RETURNS>;
}
export interface SchemaFunctionFactory<VERSION extends string, IN extends [(TypeString | OptionalTypeString), string][] = [], OUT extends [TypeString, string][] = [], RETURNS extends TypeString = "VOID"> {
	in<TYPE extends TypeString | OptionalTypeString, NAME extends string> (type: TYPE, name: NAME): SchemaFunctionFactory<VERSION, [...IN, [TYPE, NAME]]>
	out<TYPE extends TypeString, NAME extends string> (type: TYPE, name: NAME): SchemaFunctionFactory<VERSION, IN, [...OUT, [TYPE, NAME]]>
	returns<TYPE extends TypeString> (returns: TYPE): SchemaFunctionFactory<VERSION, IN, OUT, TYPE>
	sql (sql: sql): FunctionSchema<VERSION, IN, OUT, RETURNS>;
	plpgsql (sql: sql): FunctionSchema<VERSION, IN, OUT, RETURNS>;
	plpgsql (declarations: Record<string, TypeString>, plpgsql: sql): FunctionSchema<VERSION, IN, OUT, RETURNS>;
}

export interface SchemaTriggerFunctionFactory<VERSION extends string> {
	sql (sql: sql): FunctionSchema<VERSION, [], [], "TRIGGER">;
	plpgsql (plpgsql: sql): FunctionSchema<VERSION, [], [], "TRIGGER">;
	plpgsql (declarations: Record<string, TypeString>, plpgsql: sql): FunctionSchema<VERSION, [], [], "TRIGGER">;
}

class Schema {

	public static database<SCHEMA extends Partial<DatabaseSchema> | null> (schema: SCHEMA): SCHEMA extends null ? null : SCHEMA extends infer S extends Partial<DatabaseSchema> ? ValidateDatabaseSchema<{
		tables: S["tables"] extends undefined ? {} : S["tables"] & {};
		indices: S["indices"] extends undefined ? {} : S["indices"] & {};
		enums: S["enums"] extends undefined ? {} : S["enums"] & {};
		triggers: S["triggers"] extends undefined ? {} : S["triggers"] & {};
		functions: S["functions"] extends undefined ? {} : S["functions"] & {};
		collations: S["collations"] extends undefined ? {} : S["collations"] & {};
		types: S["types"] extends undefined ? {} : S["types"] & {};
	}> : never {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return schema as any;
	}

	public static enum<ENUM extends object> (enm: ENUM): SchemaEnum<EnumToTuple<ENUM>> & { [KEY in keyof ENUM as ENUM[KEY] extends number ? KEY : never]: KEY } {
		let enumName: string | undefined
		const schema = {
			VALUES: [] as never,
			sql: {} as never,
			setName (name) {
				enumName = name;
				regen();
				return this;
			},
		} as SchemaEnum<EnumToTuple<ENUM>> & { [KEY in keyof ENUM as ENUM[KEY] extends number ? KEY : never]: KEY };
		regen();
		return schema as never;

		function regen () {
			schema.VALUES = [] as never
			schema.sql = {} as never
			for (let i = 0; ; i++) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				const value = (enm as any)[i];
				if (typeof value !== "string")
					break;

				(schema.VALUES as string[]).push(value);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				(schema as any)[value] = value;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				(schema.sql as any)[value] = sql`'${sql.raw(value)}'${enumName ? sql`::${sql.raw(enumName)}` : sql``}`;
			}
		}
	}

	public static table<SCHEMA> (schema: SCHEMA): ValidateTableSchema<SCHEMA> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return schema as any;
	}

	public static readonly INDEX = {};
	public static readonly TRIGGER = {};
	/** @deprecated */
	public static readonly TRIGGER_FUNCTION: FunctionSchema<"-1", [], [], "TRIGGER"> = { version: "-1", in: [], out: [], return: "TRIGGER", sql: sql`` };
	public static readonly COLLATION = {};

	public static triggerFunction<VERSION extends string> (version: VERSION): SchemaTriggerFunctionFactory<VERSION> {
		return {
			sql (sql: sql) {
				return {
					version,
					in: [],
					out: [],
					return: "TRIGGER",
					sql,
				} as FunctionSchema<VERSION, [], [], "TRIGGER">;
			},
			plpgsql: (declarations: Record<string, TypeString> | sql, plpgsql?: sql) => {
				if (sql.is(declarations))
					plpgsql = declarations, declarations = {};
				return {
					version,
					in: [],
					out: [],
					return: "TRIGGER",
					declarations,
					plpgsql,
				} as never;
			},
		}
	}

	/** @deprecated */
	public static legacyFunction<IN extends (TypeString | OptionalTypeString)[]> (...args: IN): SchemaLegacyFunctionFactory<IN> {
		const varsOut: [TypeString, string][] = []
		let returnType: TypeString = "VOID";
		const factory: SchemaLegacyFunctionFactory<any[], any[], any> = {
			out: (...out) => {
				varsOut.push(out);
				return factory as never
			},
			returns: returns => {
				returnType = returns;
				return factory as never
			},
			get: () => 0 as never,
		};

		return factory as never;
	}

	public static function<VERSION extends string> (version: VERSION): SchemaFunctionFactory<VERSION> {
		const varsIn: [(TypeString | OptionalTypeString), string][] = [];
		const varsOut: [TypeString, string][] = []
		let returnType: TypeString = "VOID";
		const factory: SchemaFunctionFactory<VERSION, any[], any[], any> = {
			in: (type, name) => {
				varsIn.push([type, name]);
				return factory as never;
			},
			out: (...out) => {
				varsOut.push(out);
				return factory as never
			},
			returns: returns => {
				returnType = returns;
				return factory as never
			},
			sql: (sql: sql) => ({
				version,
				in: varsIn,
				out: varsOut,
				return: returnType,
				sql,
			} as never),
			plpgsql: (declarations: Record<string, TypeString> | sql, plpgsql?: sql) => {
				if (sql.is(declarations))
					plpgsql = declarations, declarations = {};
				return {
					version,
					in: varsIn,
					out: varsOut,
					return: returnType,
					declarations,
					plpgsql,
				} as never;
			},
		};

		return factory as never;
	}

	public static primaryKey<KEYS extends string[]> (...keys: KEYS): KEYS[number][] {
		return keys;
	}

	public static optional<TYPE extends TypeString> (type: TYPE): { type: TYPE, optional: true } {
		return { type, optional: true };
	}

	public static getSingleColumnPrimaryKey<SCHEMA extends TableSchema> (schema: SCHEMA) {
		const primaryKey = schema["PRIMARY_KEY"] as Schema.Column<SCHEMA>[] | undefined;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		// const primaryKey = ?.[0];
		if (!primaryKey || primaryKey.length !== 1)
			throw new Error("No primary key or primary key is multiple columns");

		return primaryKey[0];
	}

	public static getPrimaryKey<SCHEMA extends TableSchema> (schema: SCHEMA) {
		const primaryKey = schema["PRIMARY_KEY"] as Schema.Column<SCHEMA>[] | undefined;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		// const primaryKey = ?.[0];
		if (!primaryKey?.length)
			throw new Error("No primary key");

		return primaryKey;
	}

	public static isColumn<SCHEMA extends TableSchema> (schema: SCHEMA, column: keyof SCHEMA, type: TypeString) {
		let columnType = schema[column] as TypeString | OptionalTypeString;
		if (!columnType)
			throw new Error(`No column ${String(column)} in schema`);

		if (typeof columnType === "object")
			columnType = columnType.type;

		switch (type) {
			case "TIMESTAMP":
				return columnType.startsWith("TIMESTAMP");
			default:
				return columnType === type;
		}
	}
}

export default Schema;

namespace Schema {

	export type PrimaryKey<SCHEMA> =
		SCHEMA extends SpecialKeys<any> ? SCHEMA["PRIMARY_KEY"] : never;
	export type PrimaryKeyOrNull<SCHEMA> =
		SCHEMA extends { PRIMARY_KEY: infer KEY } ? KEY : null;

	export type PrimaryKeyed<SCHEMA, KEY extends keyof SCHEMA | (keyof SCHEMA)[]> =
		SCHEMA & { PRIMARY_KEY: KEY };

	export type DropPrimaryKey<SCHEMA> = Omit<SCHEMA, "PRIMARY_KEY">;

	export type Column<SCHEMA> = keyof SCHEMA extends infer KEYS ? KEYS extends keyof SpecialKeys<any> ? never : keyof SCHEMA : never;
	export type ColumnTyped<SCHEMA, TYPE> =
		Vaguify<TYPE extends OptionalTypeString<infer TYPE2> ? TYPE2 : TYPE> extends infer TYPE2 ?
		keyof { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends TYPE2 ? COLUMN : never]: SCHEMA[COLUMN]; }
		: never;

	export type Columns<SCHEMA, ALIASES = {}> = { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN extends keyof ALIASES ? ALIASES[COLUMN] & string : COLUMN]: SCHEMA[COLUMN] };
	export type TableColumns<NAME extends string, SCHEMA, ALIASES = {}> = Columns<SCHEMA, ALIASES> extends infer COLUMNS ? { [COLUMN in keyof COLUMNS as `${NAME}.${COLUMN & string}`]: COLUMNS[COLUMN] } : never;
	export type RowOutput<SCHEMA> = (
		{ [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? never : COLUMN]: OutputTypeFromString<Extract<SCHEMA[COLUMN], TypeString>> }
		& { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? COLUMN : never]?: OutputTypeFromString<Extract<SCHEMA[COLUMN] extends OptionalTypeString<infer TYPE> ? TYPE : never, TypeString>> | null }
	) extends infer T ? { [P in keyof T]: T[P] } : never;
	export type RowInput<SCHEMA, VARS = {}> = (
		{ [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? never : COLUMN]: InputTypeFromString<Extract<SCHEMA[COLUMN], TypeString>, VARS> }
		& { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends OptionalTypeString ? COLUMN : never]?: InputTypeFromString<Extract<SCHEMA[COLUMN] extends OptionalTypeString<infer TYPE> ? TYPE : never, TypeString>, VARS> | null }
	) extends infer T ? { [P in keyof T]: T[P] } : never;

	type Vaguify<T> = T extends TypeStringMap[DataTypeID.BIGINT] ? TypeStringMap[DataTypeID.BIGINT] | TypeStringMap[DataTypeID.BIGSERIAL]
		: T;
}
