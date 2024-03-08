import { QueryResult } from "pg";
import { InputTypeFromString, ValidType } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression from "../expressions/Expression";
import Statement from "./Statement";

export default class UpdateTable<SCHEMA extends TableSchema, RESULT = [], VARS = {}> extends Statement<RESULT> {

	private vars: any[];
	public constructor (public readonly tableName: string | undefined, public readonly schema: SCHEMA, vars?: any[]) {
		super();
		this.vars = vars ?? [];
	}

	private assignments: string[] = [];
	public set (input: Partial<Schema.RowInput<SCHEMA, VARS>>): this;
	public set<COLUMN_NAME extends Schema.Column<SCHEMA>> (column: COLUMN_NAME, value: InputTypeFromString<SCHEMA[COLUMN_NAME], VARS>): this;
	public set (input: Schema.Column<SCHEMA> | Partial<Schema.RowInput<SCHEMA, VARS>>, value?: ValidType) {
		if (typeof input === "object") {
			for (const column of Object.keys(input))
				this.set(column as Schema.Column<SCHEMA>, input[column] as never);

		} else {
			if (Schema.isColumn(this.schema, input, "TIMESTAMP") && typeof value === "number")
				value = new Date(value);
			this.assignments.push(`${String(input)}=${Expression.stringifyValue(value, this.vars)}`);
		}

		return this;
	}

	public compile () {
		return this.queryable(`UPDATE ${this.tableName ?? ""} SET ${this.assignments.join(",")}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}