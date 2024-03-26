import { Pool, PoolClient, QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";

type SelectResult<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[]> = { [K in "*" extends COLUMNS[number] ? Schema.Column<SCHEMA> : COLUMNS[number]]: OutputTypeFromString<SCHEMA[K]> };

export default class SelectFromTable<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[] = Schema.Column<SCHEMA>[], RESULT = SelectResult<SCHEMA, COLUMNS>[]> extends Statement<RESULT> {

	private vars: any[] = [];
	public constructor (public readonly tableName: string, public readonly schema: SCHEMA, public readonly columns: COLUMNS) {
		super();
	}

	private condition?: string;
	public where (initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars);
		this.condition = `WHERE (${queryable.text})`;
		return this;
	}

	public primaryKeyed (id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>, initialiser?: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>) {
		const primaryKey = Schema.getSingleColumnPrimaryKey(this.schema);
		this.where(expr => {
			const e2 = expr.var(primaryKey).equals(id as never);
			if (initialiser)
				e2.and(initialiser);
			return e2;
		});
		return this.limit(1);
	}

	private _limit?: number;
	public limit (count: 1): SelectFromTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS> | undefined>;
	public limit (count: number): SelectFromTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS>[]>;
	public limit (count: number): SelectFromTable<SCHEMA, COLUMNS, any> {
		this._limit = count;
		return this;
	}

	public compile () {
		return this.queryable(`SELECT ${this.columns.join(",")} FROM ${this.tableName} ${this.condition ?? ""} ${this._limit ? `LIMIT ${this._limit}` : ""}`, undefined, this.vars);
	}

	public async queryOne (pool: Pool | PoolClient) {
		return this.limit(1).query(pool);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		if (this._limit !== 1)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return output.rows;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return output.rows[0];
	}
}
