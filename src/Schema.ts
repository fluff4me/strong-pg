import { DataTypeID, EnumToTuple, InputTypeFromString, OutputTypeFromString, TypeString, TypeStringMap } from "./IStrongPG";

interface SpecialKeys<SCHEMA> {
	PRIMARY_KEY?: keyof SCHEMA | (keyof SCHEMA)[];
}

type SchemaBase = Record<string, TypeString>;

// type Schema<SCHEMA extends SchemaBase = SchemaBase> = { PRIMARY_KEY?: keyof SCHEMA } & SCHEMA;

export type TableSchema = Record<string, any>;

export interface DatabaseSchema {
	tables: Record<string, TableSchema>;
	indices: Record<string, {}>;
	enums: Record<string, string[]>;
	triggers: Record<string, {}>;
	functions: Record<string, (...args: any[]) => any>;
	collations: Record<string, {}>;
}

export namespace DatabaseSchema {
	export interface Empty {
		tables: {};
		indices: {};
		enums: {};
		triggers: {};
		functions: {};
		collations: {};
	}

	export type TableName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["tables"] & string;
	export type IndexName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["indices"] & string;
	export type EnumName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["enums"] & string;
	export type TriggerName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["triggers"] & string;
	export type FunctionName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["functions"] & string;
	export type CollationName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["collations"] & string;

	export type Table<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> =
		SCHEMA["tables"][NAME] extends infer TABLE ? TABLE extends TableSchema ? TABLE : never : never;

	export type Enum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> =
		SCHEMA["enums"][NAME] & string[];
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
}

class Schema {

	public static database<SCHEMA extends Partial<DatabaseSchema> | null> (schema: SCHEMA): SCHEMA extends null ? null : SCHEMA extends infer S extends Partial<DatabaseSchema> ? ValidateDatabaseSchema<{
		tables: S["tables"] extends undefined ? {} : S["tables"] & {};
		indices: S["indices"] extends undefined ? {} : S["indices"] & {};
		enums: S["enums"] extends undefined ? {} : S["enums"] & {};
		triggers: S["triggers"] extends undefined ? {} : S["triggers"] & {};
		functions: S["functions"] extends undefined ? {} : S["functions"] & {};
		collations: S["collations"] extends undefined ? {} : S["collations"] & {};
	}> : never {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return schema as any;
	}

	public static enum<ENUM extends object> (enm: ENUM) {
		const schema = {
			VALUES: [],
		} as SchemaEnum<EnumToTuple<ENUM>> & { [KEY in keyof ENUM as ENUM[KEY] extends number ? KEY : never]: KEY };
		for (let i = 0; ; i++) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			const value = (enm as any)[i];
			if (typeof value !== "string")
				break;

			(schema.VALUES as string[]).push(value);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(schema as any)[value] = value;
		}
		return schema;
	}

	public static table<SCHEMA> (schema: SCHEMA): ValidateTableSchema<SCHEMA> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return schema as any;
	}

	public static readonly INDEX = {};
	public static readonly TRIGGER = {};
	public static readonly FUNCTION: (...args: any[]) => any = () => undefined;
	public static readonly COLLATION = {};

	public static primaryKey<KEYS extends string[]> (...keys: KEYS): KEYS[number][] {
		return keys;
	}

	public static getSingleColumnPrimaryKey<SCHEMA extends TableSchema> (schema: SCHEMA) {
		const primaryKey = schema["PRIMARY_KEY"] as Schema.Column<SCHEMA>[] | undefined;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		// const primaryKey = ?.[0];
		if (!primaryKey || primaryKey.length !== 1)
			throw new Error("No primary key or primary key is multiple columns");

		return primaryKey[0];
	}

	public static isColumn<SCHEMA extends TableSchema> (schema: SCHEMA, column: keyof SCHEMA, type: TypeString) {
		const columnType = schema[column] as TypeString;
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
		keyof { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : SCHEMA[COLUMN] extends Vaguify<TYPE> ? COLUMN : never]: SCHEMA[COLUMN] };
	export type Columns<SCHEMA> = { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN]: SCHEMA[COLUMN] };
	export type RowOutput<SCHEMA> = { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN]: OutputTypeFromString<Extract<SCHEMA[COLUMN], TypeString>> };
	export type RowInput<SCHEMA, VARS = {}> = { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN]: InputTypeFromString<Extract<SCHEMA[COLUMN], TypeString>, VARS> };

	type Vaguify<T> = T extends TypeStringMap[DataTypeID.BIGINT] ? TypeStringMap[DataTypeID.BIGINT] | TypeStringMap[DataTypeID.BIGSERIAL]
		: T;
}
