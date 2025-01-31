import { QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";

export default class DeleteFromTable<SCHEMA extends TableSchema, RESULT = []> extends Statement<RESULT> {

	private vars: any[] = [];
	public constructor (public readonly tableName: string | undefined, public readonly schema: SCHEMA) {
		super();
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
	public returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: RETURNING_COLUMNS): DeleteFromTable<SCHEMA, { [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]> }[]>;
	public returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | "*"> (columns: RETURNING_COLUMN): DeleteFromTable<SCHEMA, { [KEY in RETURNING_COLUMN extends "*" ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]> }[]>;
	public returning (...columns: (Schema.Column<SCHEMA> | "*")[]) {
		this.returningColumns = columns;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as DeleteFromTable<SCHEMA, any>;
	}

	public compile () {
		const returning = !this.returningColumns?.length ? ""
			: `RETURNING ${this.returningColumns.join(",")}`;
		return this.queryable(`DELETE FROM ${this.tableName ?? ""} ${this.condition ?? ""} ${returning}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}