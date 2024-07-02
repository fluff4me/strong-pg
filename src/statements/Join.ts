import { Pool, PoolClient, QueryResult } from "pg";
import { Initialiser, OutputTypeFromString } from "../IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "../Schema";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";

enum JoinType {
	Inner,
	"Left Outer",
	"Full Outer",
	"Right Outer",
}

type JoinTypeName = Uppercase<keyof typeof JoinType>;

export type JoinColumns<TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> =
	Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ?
	Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ?
	Exclude<TABLE1_COLUMNS, TABLE2_COLUMNS> | Exclude<TABLE2_COLUMNS, TABLE1_COLUMNS> extends infer COLUMNS_UNION ?

	| COLUMNS_UNION
	| (TABLE1_NAME extends "" ? never : `${TABLE1_NAME}.${TABLE1_COLUMNS}`)
	| `${TABLE2_NAME}.${TABLE2_COLUMNS}`

	: never : never : never;

export type JoinTables<TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> =
	Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ?
	Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ?
	JoinColumns<TABLE1, TABLE2, TABLE1_NAME, TABLE2_NAME> extends infer COLUMNS extends string ?

	{
		[COLUMN in COLUMNS]:
		| COLUMN extends TABLE1_COLUMNS ? TABLE1[COLUMN]
		: COLUMN extends TABLE2_COLUMNS ? TABLE2[COLUMN]
		: COLUMN extends `${TABLE1_NAME}.${infer BASENAME extends TABLE1_COLUMNS}` ? TABLE1[BASENAME]
		: COLUMN extends `${TABLE2_NAME}.${infer BASENAME extends TABLE2_COLUMNS}` ? TABLE2[BASENAME]
		: never
	}

	: never
	: never
	: never

export default class Join<DATABASE extends DatabaseSchema, VIRTUAL_TABLE extends TableSchema> extends Statement {

	private vars: any[] = [];
	public constructor (private readonly type: JoinTypeName, private readonly table1: string | undefined, private readonly table2: string, private readonly alias1?: string, private readonly alias2?: string) {
		super();
	}

	private condition?: string;
	public on (initialiser: ExpressionInitialiser<Schema.Columns<VIRTUAL_TABLE>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars);
		this.condition = `ON (${queryable.text})`;
		return this;
	}

	public innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>>("INNER", undefined, tableName, undefined, alias);
	}

	/**
	 * SELECT *
	 */
	public select (): SelectFromJoin<VIRTUAL_TABLE, "*"[]>;
	/**
	 * SELECT columns
	 */
	public select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]> (...columns: COLUMNS): SelectFromJoin<VIRTUAL_TABLE, COLUMNS>;
	/**
	 * SELECT *
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromJoin<VIRTUAL_TABLE, "*"[], any> = SelectFromJoin<VIRTUAL_TABLE, "*"[]>> (initialiser: Initialiser<SelectFromJoin<VIRTUAL_TABLE, "*"[]>, RETURN>): RETURN;
	/**
	 * SELECT columns
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromJoin<VIRTUAL_TABLE, COLUMNS, any>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromJoin<VIRTUAL_TABLE, COLUMNS>, RETURN>]): RETURN;
	public select (...params: (Schema.Column<VIRTUAL_TABLE> | "*" | Initialiser<SelectFromJoin<VIRTUAL_TABLE>> | Initialiser<SelectFromJoin<VIRTUAL_TABLE, "*"[]>>)[]): SelectFromJoin<VIRTUAL_TABLE, Schema.Column<VIRTUAL_TABLE>[]> | SelectFromJoin<VIRTUAL_TABLE, "*"[]> {
		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<SelectFromJoin<VIRTUAL_TABLE>> : undefined;
		if (params.length === 0)
			params.push("*");

		const query = new SelectFromJoin<VIRTUAL_TABLE>(this as Join<DatabaseSchema, TableSchema>, params as Schema.Column<VIRTUAL_TABLE>[]);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return initialiser?.(query) ?? query;
	}

	public override compile (): Statement.Queryable {
		if (this.type !== "INNER" && !this.condition)
			throw new Error(`Unable to join ${this.table1 ?? "(joined table)"} and ${this.table2}, no ON expression provided`);

		const type = this.type === "INNER" && !this.condition ? "CROSS" : this.type;
		return new Statement.Queryable(`${this.table1 ?? ""} ${this.alias1 ?? ""} ${type} JOIN ${this.table2} ${this.alias2 ?? ""} ${this.condition ?? ""}`, undefined, this.vars);
	}
}

type JoinedTablesOutput<TABLE extends TableSchema, COLUMNS extends (Schema.Column<TABLE> | "*")[]> =
	"*" extends COLUMNS[number] ? Schema.Column<TABLE> : Exclude<COLUMNS[number], "*"> extends infer COLUMNS extends Schema.Column<TABLE> ?

	({
		[COLUMN in COLUMNS as (
			COLUMN extends `${string}.${infer REAL_COLUMN}` ?

			Extract<Exclude<COLUMNS, COLUMN>, `${string}.${REAL_COLUMN}`> extends infer OTHER_COLUMNS ?

			| [OTHER_COLUMNS] extends [never] ? REAL_COLUMN
			: `strong-pg error: Unable to resolve duplicate column name: ${Extract<COLUMN | OTHER_COLUMNS, string>}`

			: never

			: COLUMN
		)]:
		| OutputTypeFromString<TABLE[COLUMN]>
	}) extends infer RESULT ?
	[Extract<keyof RESULT, `strong-pg error:${string}`>] extends infer ERROR ?

	| ERROR extends [never] ? RESULT
	: ERROR extends [`strong-pg error: ${infer ERROR_TEXT}`] ? ERROR_TEXT
	: never

	: never
	: never

	: never

export class SelectFromJoin<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[] = Schema.Column<SCHEMA>[], RESULT = JoinedTablesOutput<SCHEMA, COLUMNS>[]> extends Statement<RESULT> {

	private vars: any[];
	public constructor (private readonly join: Join<DatabaseSchema, TableSchema>, public readonly columns: COLUMNS) {
		super();
		this.vars = join["vars"];
	}

	private condition?: string;
	public where (initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars);
		this.condition = `WHERE (${queryable.text})`;
		return this;
	}

	private _limit?: number;
	public limit (count: 1): SelectFromJoin<SCHEMA, COLUMNS, JoinedTablesOutput<SCHEMA, COLUMNS> | undefined>;
	public limit (count: number): SelectFromJoin<SCHEMA, COLUMNS, JoinedTablesOutput<SCHEMA, COLUMNS>[]>;
	public limit (count: number): SelectFromJoin<SCHEMA, COLUMNS, any> {
		this._limit = count;
		return this;
	}

	private _orderByColumn?: Schema.Column<SCHEMA>;
	private _orderByDirection?: string;
	public orderBy (column: Schema.Column<SCHEMA>, order = "ASC") {
		this._orderByColumn = column;
		this._orderByDirection = order;
		return this;
	}

	private _offset?: number;
	public offset (amount: number) {
		if (typeof amount !== "number")
			throw new Error("Unsafe value for offset");
		this._offset = amount;
		return this;
	}

	public compile () {
		const orderBy = this._orderByColumn && this._orderByDirection ? `ORDER BY ${String(this._orderByColumn)} ${this._orderByDirection}` : "";
		const offset = this._offset ? `OFFSET ${this._offset}` : "";
		const limit = this._limit ? `LIMIT ${this._limit}` : "";
		const join = this.join.compile();
		return this.queryable(`SELECT ${this.columns.join(",")} FROM ${join.text} ${this.condition ?? ""} ${orderBy} ${offset} ${limit}`, undefined, this.vars);
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

