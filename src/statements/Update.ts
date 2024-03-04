import { QueryResult } from "pg";
import { InputTypeFromString, ValidType } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression from "../expressions/Expression";
import Statement from "./Statement";

export default class UpdateTable<SCHEMA extends TableSchema, RESULT = []> extends Statement<RESULT> {

	private vars?: any[];
	public constructor (public readonly tableName: string | undefined, public readonly schema: SCHEMA, vars?: any[]) {
		super();
		this.vars = vars ?? [];
	}

	private assignments: string[] = [];
	public set (input: Partial<Schema.RowInput<SCHEMA>>): this;
	public set<COLUMN_NAME extends Schema.Column<SCHEMA>> (column: COLUMN_NAME, value: InputTypeFromString<SCHEMA[COLUMN_NAME]>): this;
	public set (input: Schema.Column<SCHEMA> | Partial<Schema.RowInput<SCHEMA>>, value?: ValidType) {
		if (typeof input === "object")
			for (const column of Object.keys(input))
				this.assignments.push(`${column} = ${Expression.stringifyValue(input[column], this.vars)}`);
		else
			this.assignments.push(`${String(input)} = ${Expression.stringifyValue(value, this.vars)}`);
		return this;
	}

	public compile () {
		return this.queryable(`UPDATE ${this.tableName ?? ""} SET ${this.assignments.join(", ")}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}