import { Pool, PoolClient, QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion, SortDirection } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";

// type JoinedTablesOutput<TABLE extends TableSchema, COLUMN_ALIASES extends Partial<Record<Schema.Column<TABLE>, string>> = {}> =
// 	keyof TABLE extends infer COLUMNS ?

// 	({
// 		[COLUMN in COLUMNS as (
// 			COLUMN extends keyof COLUMN_ALIASES ? COLUMN_ALIASES[COLUMN] & string : (
// 				COLUMN extends `${string}.${infer REAL_COLUMN}` ?

// 				Extract<Exclude<COLUMNS, COLUMN>, `${string}.${REAL_COLUMN}`> extends infer OTHER_COLUMNS ?

// 				| [OTHER_COLUMNS] extends [never] ? REAL_COLUMN
// 				: `strong-pg error: Unable to resolve duplicate column name: ${Extract<COLUMN | OTHER_COLUMNS, string>}`

// 				: never

// 				: COLUMN & string
// 			)
// 		)]:
// 		| TABLE[COLUMN & Schema.Column<TABLE>]
// 	}) extends infer RESULT ?
// 	[Extract<keyof RESULT, `strong-pg error:${string}`>] extends infer ERROR ?

// 	| ERROR extends [never] ? RESULT
// 	: ERROR extends [`strong-pg error: ${infer ERROR_TEXT}`] ? ERROR_TEXT
// 	: never

// 	: never
// 	: never

// 	: never

export type SelectColumns<SCHEMA extends TableSchema> =
	| "*"
	| Schema.Column<SCHEMA>[]
	| Partial<Record<Schema.Column<SCHEMA>, string>>

type SelectResult<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA>> =
	COLUMNS extends Partial<Record<Schema.Column<SCHEMA>, string>> ?
	| { [K in keyof COLUMNS as COLUMNS[K] & PropertyKey]: OutputTypeFromString<SCHEMA[K & Schema.Column<SCHEMA>]> }

	: (COLUMNS extends any[] ? COLUMNS[number] : Schema.Column<SCHEMA>) extends infer COLUMNS ?
	| { [K in COLUMNS & PropertyKey]: OutputTypeFromString<SCHEMA[K & keyof SCHEMA]> }

	: never

type Order<SCHEMA extends TableSchema> =
	| [column: Schema.Column<SCHEMA>, order?: SortDirection]
	| [null: null, column: Schema.Column<SCHEMA>, order?: SortDirection]

export class SelectFromVirtualTable<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA> = Schema.Column<SCHEMA>[], RESULT = SelectResult<SCHEMA, COLUMNS>[]> extends Statement<RESULT> {

	private vars: any[];
	public constructor (private readonly from: VirtualTable<SCHEMA> | string, public readonly columns: COLUMNS) {
		super();
		this.vars = (typeof from === "string" ? undefined : from?.["vars"]) ?? [];
	}

	private condition?: string;
	public where (initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars);
		this.condition = `WHERE (${queryable.text})`;
		return this;
	}

	private _limit?: number;
	public limit (count: 1): SelectFromVirtualTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS> | undefined>;
	public limit (count: number): SelectFromVirtualTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS>[]>;
	public limit (count: number): SelectFromVirtualTable<SCHEMA, COLUMNS, any> {
		this._limit = count;
		return this;
	}

	private _orderBy?: Order<SCHEMA>[]
	public orderBy (column: Schema.Column<SCHEMA>, order?: SortDirection): this;
	public orderBy (orders: Order<SCHEMA>[]): this;
	public orderBy (...args: Order<SCHEMA> | [Order<SCHEMA>[]]) {
		if (Array.isArray(args[0]))
			this._orderBy = args[0]
		else
			this._orderBy = [args as Order<SCHEMA>];
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
		const orderBy = this._orderBy?.length ? `ORDER BY ${this._orderBy
			.map(order => order[0] === null ? `${String(order[1])} IS NULL ${order[2]?.description ?? ""}` : `${String(order[0])} ${(order[1] as symbol)?.description ?? ""}`)
			.join(",")}` : "";
		const offset = this._offset ? `OFFSET ${this._offset}` : "";
		const limit = this._limit ? `LIMIT ${this._limit}` : "";
		const from = typeof this.from === "string" ? this.from : this.from.compileFrom?.() ?? this.from["name"]
		const columns = this.columns === "*" ? "*"
			: Array.isArray(this.columns) ? this.columns.join(",")
				: Object.entries(this.columns)
					.map(([column, alias]) => column === alias ? column : `${column} ${alias as string}`)
					.join(",");
		return this.queryable(`${this.compileWith()}SELECT ${columns} FROM ${from} ${this.condition ?? ""} ${orderBy} ${offset} ${limit}`, undefined, this.vars);
	}

	private compileWith () {
		const withExpr = typeof this.from === "string" ? undefined : this.from.compileWith?.();
		return !withExpr ? "" : `WITH ${withExpr} `
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

export default class SelectFromTable<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA> = "*"> extends SelectFromVirtualTable<SCHEMA, COLUMNS> {

	public constructor (public readonly tableName: string, public readonly schema: SCHEMA, columns: COLUMNS) {
		super(tableName, columns);
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
}
