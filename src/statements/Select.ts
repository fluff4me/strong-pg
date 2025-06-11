import { Pool, PoolClient, QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion, SortDirection, ValidType } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import sql from "../sql";
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

export type SelectColumns<SCHEMA extends TableSchema, NAME extends string, VARS = SelectWhereVars<SCHEMA, NAME>> =
	| "*"
	| Schema.Column<SCHEMA>[]
	| SelectColumnsRecord<SCHEMA, NAME, VARS>

export type SelectColumnsRecord<SCHEMA extends TableSchema, NAME extends string = never, VARS = SelectWhereVars<SCHEMA, NAME>> =
	Partial<Record<string, Schema.Column<SCHEMA> | ExpressionInitialiser<VARS, ValidType>>>

type SelectResult<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends SelectColumns<SCHEMA, NAME> | 1> =
	COLUMNS extends 1 ? 1 : (
		(
			COLUMNS extends SelectColumnsRecord<SCHEMA, NAME, any> ?
			| { [K in keyof COLUMNS]: COLUMNS[K] extends infer VALUE ? (
				VALUE extends Schema.Column<SCHEMA>
				? OutputTypeFromString<SCHEMA[VALUE & Schema.Column<SCHEMA>]>
				: VALUE extends ExpressionInitialiser<any, infer TYPE> ? TYPE : never
			) : never }

			: (COLUMNS extends any[] ? COLUMNS[number] : Schema.Column<SCHEMA>) extends infer COLUMNS ?
			| { [K in COLUMNS & PropertyKey]: OutputTypeFromString<SCHEMA[K & keyof SCHEMA]> }

			: never
		) extends infer RESULT
		? (RESULT extends { [KEY: `${string}.${string}`]: any }
			? { [KEY in keyof RESULT as KEY extends `${string}.${infer KEY2}` ? KEY2 : KEY]: RESULT[KEY] }
			: RESULT
		)
		: never
	)

export type Order<SCHEMA extends TableSchema> =
	| [column: Schema.Column<SCHEMA>, order?: SortDirection]
	| [null: null, column: Schema.Column<SCHEMA>, order?: SortDirection]

export namespace Order {
	export function resolve<SCHEMA extends TableSchema> (order?: Order<SCHEMA>[]) {
		return !order?.length ? ""
			: `${order
				.map(order => order[0] === null ? `${String(order[1])} IS NULL ${order[2]?.description ?? ""}` : `${String(order[0])} ${(order[1] as symbol)?.description ?? ""}`)
				.join(",")}`;
	}
}

type SelectWhereVars<SCHEMA extends TableSchema, NAME extends string> = Schema.Columns<SCHEMA> extends infer BASE ?
	BASE & { [KEY in keyof BASE as KEY extends string ? `${NAME}.${KEY}` : never]: BASE[KEY] }
	: never

export class SelectFromVirtualTable<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends SelectColumns<SCHEMA, NAME> | 1 = Schema.Column<SCHEMA>[], RESULT = SelectResult<SCHEMA, NAME, COLUMNS>[]> extends Statement<RESULT> {

	private vars: any[];
	public constructor (private readonly from: VirtualTable<SCHEMA, NAME> | string, public readonly columns: COLUMNS) {
		super();
		this.vars = (typeof from === "string" ? undefined : from?.["vars"]) ?? [];
	}

	private condition?: string;
	public where (initialiser: sql | ExpressionInitialiser<SelectWhereVars<SCHEMA, NAME>, boolean>) {
		const queryable = sql.is(initialiser) ? initialiser : Expression.compile(initialiser, undefined, this.vars);
		this.condition = `WHERE (${queryable.text})`;
		return this;
	}

	private _limit?: number;
	public limit (count: 1): SelectFromVirtualTable<SCHEMA, NAME, COLUMNS, SelectResult<SCHEMA, NAME, COLUMNS> | undefined>;
	public limit (count?: number): SelectFromVirtualTable<SCHEMA, NAME, COLUMNS, SelectResult<SCHEMA, NAME, COLUMNS>[]>;
	public limit (count?: number): SelectFromVirtualTable<SCHEMA, NAME, COLUMNS, any> {
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
	public offset (amount?: number) {
		if (typeof amount !== "number" && amount !== undefined)
			throw new Error("Unsafe value for offset");
		this._offset = amount;
		return this;
	}

	public compile () {
		let orderBy = Order.resolve(this._orderBy);
		orderBy = orderBy ? `ORDER BY ${orderBy}` : "";
		const offset = this._offset ? `OFFSET ${this._offset}` : "";
		const limit = this._limit ? `LIMIT ${this._limit}` : "";
		const from = typeof this.from === "string" ? this.from : this.from.compileFrom?.() ?? this.from["name"]
		const columns = this.columns === "*" ? "*"
			: Array.isArray(this.columns) ? this.columns.join(",")
				: Object.entries(this.columns)
					.map(([alias, column]) => {
						if (column === alias)
							return column as string;

						if (typeof column === "string")
							return `${column} ${alias}`;

						if (sql.is(column)) {
							const text = column.compile(this.vars);
							return `${text} ${alias}`;
						}

						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						const queryable = Expression.compile(column, undefined, this.vars)
						return `${queryable.text} ${alias}`;
					})
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

export default class SelectFromTable<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends SelectColumns<SCHEMA, NAME> | 1 = "*"> extends SelectFromVirtualTable<SCHEMA, NAME, COLUMNS> {

	public constructor (public readonly tableName: NAME, public readonly schema: SCHEMA, columns: COLUMNS) {
		super(tableName, columns);
	}

	public primaryKeyed (id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>, initialiser?: ExpressionInitialiser<SelectWhereVars<SCHEMA, NAME>, boolean>) {
		const primaryKey = Schema.getSingleColumnPrimaryKey(this.schema);
		this.where(expr => {
			const e2 = expr.var(primaryKey as never).equals(id as never);
			if (initialiser)
				e2.and(initialiser);
			return e2;
		});
		return this.limit(1);
	}
}
