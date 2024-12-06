import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import { SearchType, SortDirection } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import { SelectFromVirtualTable } from "./Select";

export default class Recursive<TABLE extends TableSchema, VIRTUAL_TABLE extends TableSchema, NAME extends string> extends VirtualTable<VIRTUAL_TABLE, never> {

	public constructor (private readonly tableName: NAME, private readonly columnNames: Schema.Column<TABLE>[]) {
		super(`vt_recursive_${tableName}` as never)
	}

	private anchorCondition?: string;
	public where (initialiser: ExpressionInitialiser<Schema.Columns<TABLE>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars);
		this.anchorCondition = `WHERE (${queryable.text})`;
		return this;
	}

	private recursiveCondition?: string;
	public thenWhere (initialiser: ExpressionInitialiser<Schema.Columns<TABLE> & Schema.Columns<TABLE, { [KEY in Schema.Column<TABLE>]: `current.${KEY & (string | number)}` }>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars,
			name => this.columnNames.includes(name as Schema.Column<TABLE>) ? `recursive_table.${name}` : name);
		this.recursiveCondition = `WHERE (${queryable.text})`;
		return this;
	}

	private search?: { column: Schema.Column<VIRTUAL_TABLE>, type: SearchType, direction?: SortDirection }
	public searchBy (column: Schema.Column<VIRTUAL_TABLE>, type: SearchType, direction?: SortDirection) {
		this.search = { column, type, direction }
		return this
	}

	protected override selectInitialiser (query: SelectFromVirtualTable<VIRTUAL_TABLE, "*">) {
		if (this.search)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			query.orderBy("with_recursive_search_order" as any, this.search.direction)
	}

	public override compileWith (): string {
		if (!this.recursiveCondition)
			throw new Error("A recursive condition is required")

		const anchorQuery = `SELECT ${this.columnNames.join(",")} FROM ${this.tableName} ${this.anchorCondition ?? ""}`
		const recursiveQuery = `SELECT ${this.columnNames.map(name => `recursive_table.${String(name)}`).join(",")} FROM ${this.tableName} recursive_table, ${this.name} current ${this.recursiveCondition}`
		const searchQuery = !this.search ? "" : `SEARCH ${this.search.type.description!} FIRST BY ${String(this.search.column)} SET with_recursive_search_order`
		return `RECURSIVE ${this.name}(${this.columnNames.join(",")}) AS (${anchorQuery} UNION ALL ${recursiveQuery}) ${searchQuery}`;
	}
}
