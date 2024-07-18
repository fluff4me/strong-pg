import { QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion, ValidType } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
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
				this.set(column as Schema.Column<SCHEMA>, input[column as keyof Schema.RowInput<SCHEMA, VARS>] as never);

		} else {
			if (Schema.isColumn(this.schema, input, "TIMESTAMP") && typeof value === "number")
				value = new Date(value);
			this.assignments.push(`${String(input)}=${Expression.stringifyValue(value, this.vars)}`);
		}

		return this;
	}

	private condition?: string;
	public where (initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars);
		this.condition = `WHERE (${queryable.text})`;
		return this;
	}

	public primaryKeyed (id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>) {
		const primaryKey = Schema.getSingleColumnPrimaryKey(this.schema);
		this.where(expr => expr.var(primaryKey).equals(id as never));
		return this;
	}

	private returningColumns?: (Schema.Column<SCHEMA> | "*")[];
	public returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: RETURNING_COLUMNS): UpdateTable<SCHEMA, { [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]> }[], VARS>;
	public returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | "*"> (columns: RETURNING_COLUMN): UpdateTable<SCHEMA, { [KEY in RETURNING_COLUMN extends "*" ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]> }[], VARS>;
	public returning (...columns: (Schema.Column<SCHEMA> | "*")[]) {
		this.returningColumns = columns;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as UpdateTable<SCHEMA, any, VARS>;
	}

	public compile () {
		const returning = !this.returningColumns?.length ? ""
			: `RETURNING ${this.returningColumns.join(",")}`;
		return this.queryable(`UPDATE ${this.tableName ?? ""} SET ${this.assignments.join(",")} ${this.condition ?? ""} ${returning}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}