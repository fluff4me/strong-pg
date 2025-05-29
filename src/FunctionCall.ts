import Expression from "./expressions/Expression";
import { OptionalTypeString, TypeString } from "./IStrongPG";
import { DatabaseSchema, FunctionParameters, FunctionSchema, TableSchema } from "./Schema";
import Statement from "./statements/Statement";
import { VirtualTable } from "./VirtualTable";

export type FunctionOutput<SCHEMA extends DatabaseSchema, FUNCTION extends FunctionSchema, FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>> =
	FUNCTION extends FunctionSchema<(TypeString | OptionalTypeString)[], infer OUT, infer RETURN> ?
	{ [I in keyof OUT as OUT[I] extends [TypeString, infer NAME extends PropertyKey] ? NAME : never]: OUT[I] extends [infer TYPE extends TypeString, string] ? TYPE : never } extends infer OUT_COLUMNS ?
	(
		(
			RETURN extends `SETOF ${infer TABLE_NAME extends DatabaseSchema.TableName<SCHEMA>}` ?
			(DatabaseSchema.Table<SCHEMA, TABLE_NAME> extends infer TABLE ? TABLE : never)

			: RETURN extends `SETOF ${infer TYPE_NAME extends DatabaseSchema.TypeName<SCHEMA>}` ?
			(DatabaseSchema.Type<SCHEMA, TYPE_NAME> extends infer TYPE ? TYPE : never)

			: RETURN extends `SETOF ${infer TYPE_NAME extends TypeString}` ?
			{ [KEY in FUNCTION_NAME]: TYPE_NAME }

			: never
		) extends infer TABLE ?

		[TABLE] extends [never] ?
		(OUT["length"] extends 0 ? { [KEY in FUNCTION_NAME]: RETURN } : "Error! Function return type must be a table if there are OUT parameters")
		: (
			OUT["length"] extends 0 ? TABLE
			: { [KEY in keyof TABLE | keyof OUT_COLUMNS]: KEY extends keyof OUT_COLUMNS ? OUT_COLUMNS[KEY] : KEY extends keyof TABLE ? Extract<TABLE[KEY], TypeString> : never }
		)
		: never
	)
	: never
	: never;

class FunctionCall<FUNCTION extends FunctionSchema, SCHEMA extends DatabaseSchema, FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>, OUTPUT extends TableSchema = Extract<FunctionOutput<SCHEMA, FUNCTION, FUNCTION_NAME>, TableSchema>> extends VirtualTable<OUTPUT, never> {

	private readonly params: string[];
	public constructor (private readonly functionName: FUNCTION_NAME, params: FunctionParameters<FUNCTION>) {
		super(null as never);
		this.params = params.map(param => Expression.stringifyValue(param, this.vars));
	}

	public override compileWith = undefined;
	public override compileFrom (): string {
		return `${this.functionName}(${this.params.join(",")})`;
	}

	public perform () {
		return new PerformFunction(this.compileFrom(), this.vars)
	}
}

class PerformFunction<FUNCTION extends FunctionSchema, SCHEMA extends DatabaseSchema, FUNCTION_NAME extends DatabaseSchema.FunctionName<SCHEMA>> extends Statement {

	public constructor (private readonly functionCall: string, private readonly vars: any[]) {
		super()
	}

	public override compile (): Statement.Queryable | Statement.Queryable[] {
		return new Statement.Queryable(`SELECT ${this.functionCall}`, undefined, this.vars)
	}
}

export default FunctionCall

