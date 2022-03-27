import { EnumToTuple, SetKey, TypeString } from "./IStrongPG";

interface SpecialKeys<SCHEMA> {
	PRIMARY_KEY?: keyof SCHEMA | (keyof SCHEMA)[];
}

type SchemaBase = Record<string, TypeString>;

// type Schema<SCHEMA extends SchemaBase = SchemaBase> = { PRIMARY_KEY?: keyof SCHEMA } & SCHEMA;

export interface DatabaseSchema {
	tables: Record<string, Record<string, any>>;
	indices?: Record<string, {}>;
	enums?: Record<string, string[]>;
	triggers?: Record<string, {}>;
	functions?: Record<string, any>;
}

export namespace DatabaseSchema {
	export interface Empty {
		tables: {};
	}

	export type TableName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["tables"] & string;
	export type IndexName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["indices"] & string;
	export type EnumName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["enums"] & string;
	export type TriggerName<SCHEMA extends DatabaseSchema> = keyof SCHEMA["triggers"] & string;

	export type Table<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> =
		SCHEMA["tables"][NAME];

	export type ReplaceTable<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>, TABLE_SCHEMA_NEW> =
		SetKey<SCHEMA, "tables", SetKey<SCHEMA["tables"], NAME, TABLE_SCHEMA_NEW>>;

	// export type ReplaceTableOverwrite<SCHEMA_END extends DatabaseSchema, NAME extends TableName<SCHEMA_END>, TABLE_SCHEMA_NEW> =
	// 	{ [KEY in keyof SCHEMA_END]: KEY extends "tables" ?
	// 		{ [KEY in keyof SCHEMA_END["tables"] | NAME]: KEY extends NAME ? TABLE_SCHEMA_NEW : SCHEMA_END["tables"][KEY] }
	// 		: SCHEMA_END[KEY] };

	export type DropTable<SCHEMA extends DatabaseSchema, NAME extends TableName<SCHEMA>> =
		SetKey<SCHEMA, "tables", Omit<SCHEMA["tables"], NAME>>;

	export type CreateIndex<SCHEMA extends DatabaseSchema, NAME extends string> =
		SetKey<SCHEMA, "indices", SetKey<SCHEMA["indices"], NAME, {}>>;

	export type DropIndex<SCHEMA extends DatabaseSchema, NAME extends IndexName<SCHEMA>> =
		SetKey<SCHEMA, "indices", Omit<SCHEMA["indices"], NAME>>;

	export type Enum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> =
		SCHEMA["enums"][NAME] & string[];

	export type ReplaceEnum<SCHEMA extends DatabaseSchema, NAME extends string, ENUM extends string[]> =
		SetKey<SCHEMA, "enums", SetKey<SCHEMA["enums"], NAME, ENUM>>;

	export type DropEnum<SCHEMA extends DatabaseSchema, NAME extends EnumName<SCHEMA>> =
		SetKey<SCHEMA, "enums", Omit<SCHEMA["enums"], NAME>>;

	export type CreateTrigger<SCHEMA extends DatabaseSchema, NAME extends string> =
		SetKey<SCHEMA, "triggers", SetKey<SCHEMA["triggers"], NAME, {}>>;

	export type DropTrigger<SCHEMA extends DatabaseSchema, NAME extends TriggerName<SCHEMA>> =
		SetKey<SCHEMA, "triggers", Omit<SCHEMA["triggers"], NAME>>;
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

class Schema {

	public static database<SCHEMA extends DatabaseSchema | null> (schema: SCHEMA): SCHEMA extends null ? null : ValidateDatabaseSchema<Extract<SCHEMA, DatabaseSchema>> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return schema as any;
	}

	public static enum<ENUM extends object> (enm: ENUM) {
		const result = [];
		for (let i = 0; ; i++) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			const value = (enm as any)[i];
			if (typeof value === "string")
				result.push(value);
			else
				break;
		}
		return result as EnumToTuple<ENUM>;
	}

	public static table<SCHEMA> (schema: SCHEMA): ValidateTableSchema<SCHEMA> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return schema as any;
	}

	public static readonly INDEX = {};
	public static readonly TRIGGER = {};

	public static primaryKey<KEYS extends string[]> (...keys: KEYS): KEYS[number][] {
		return keys;
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
	export type Columns<SCHEMA> = { [COLUMN in keyof SCHEMA as COLUMN extends keyof SpecialKeys<any> ? never : COLUMN]: SCHEMA[COLUMN] };
}
