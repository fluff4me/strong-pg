import { Pool, PoolClient, QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";

type SingleStringUnion<T> = ((k: ((T extends any ? () => T : never) extends infer U ? ((U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never) extends () => (infer R) ? R : never : never)) => any) extends (k: T) => any ? T : never;

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

	public primaryKeyed (id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>) {
		const primaryKey = Schema.getSingleColumnPrimaryKey(this.schema);
		this.where(expr => expr.var(primaryKey).equals(id as never));
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
