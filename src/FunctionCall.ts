import { OptionalTypeString, TypeString } from "./IStrongPG";
import Schema, { DatabaseSchema, FunctionParameters, FunctionSchema, TableSchema } from "./Schema";
import { SelectFromVirtualTable } from "./statements/Select";

export type FunctionOutput<SCHEMA extends DatabaseSchema, FUNCTION extends FunctionSchema, FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>> =
	FUNCTION extends FunctionSchema<(TypeString | OptionalTypeString)[], infer OUT, infer RETURN> ?
	{ [I in keyof OUT as OUT[I] extends [TypeString, infer NAME extends PropertyKey] ? NAME : never]: OUT[I] extends [infer TYPE extends TypeString, string] ? TYPE : never } extends infer OUT_COLUMNS ?
	RETURN extends `SETOF ${infer TABLE_NAME extends DatabaseSchema.TableName<SCHEMA>}` ?
	DatabaseSchema.Table<SCHEMA, TABLE_NAME> extends infer TABLE ?

	OUT["length"] extends 0 ? TABLE
	: { [KEY in keyof TABLE | keyof OUT_COLUMNS]: KEY extends keyof OUT_COLUMNS ? OUT_COLUMNS[KEY] : KEY extends keyof TABLE ? Extract<TABLE[KEY], TypeString> : never }

	: never
	: (OUT["length"] extends 0 ? { [KEY in FUNCTION_NAME]: RETURN } : "Error! Function return type must be a table if there are OUT parameters")
	: never
	: never

interface FunctionCall<FUNCTION extends FunctionSchema, SCHEMA extends DatabaseSchema, FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>, OUTPUT = FunctionOutput<SCHEMA, FUNCTION, FUNCTION_NAME>> {
	select<COLUMNS extends Schema.Column<OUTPUT>[]> (...columns: COLUMNS): SelectFromVirtualTable<Extract<OUTPUT, TableSchema>, never, COLUMNS>
}

function FunctionCall<FUNCTION extends FunctionSchema, SCHEMA extends DatabaseSchema, FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>> (name: FUNCTION_NAME, params: FunctionParameters<DatabaseSchema.Function<SCHEMA, FUNCTION_NAME>>): FunctionCall<FUNCTION, SCHEMA, FUNCTION_NAME> {
	return {
		select: (...columns) => new SelectFromVirtualTable<never, never, never>(name, columns as never) as never,
	}
}

export default FunctionCall

