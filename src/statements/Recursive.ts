import type { ExpressionInitialiser } from '../expressions/Expression'
import Expression from '../expressions/Expression'
import type { SearchType, SortDirection } from '../IStrongPG'
import type Schema from '../Schema'
import type { TableSchema } from '../Schema'
import { VirtualTable } from '../VirtualTable'
import type { Order, SelectFromVirtualTable } from './Select'

export default class Recursive<TABLE extends TableSchema, VIRTUAL_TABLE extends TableSchema, NAME extends string> extends VirtualTable<VIRTUAL_TABLE, never> {

	public constructor (private readonly tableName: NAME, private readonly columnNames: Schema.Column<TABLE>[]) {
		super(`vt_recursive_${tableName}` as never)
	}

	private anchorCondition?: string
	public where (initialiser: ExpressionInitialiser<Schema.Columns<TABLE>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars)
		this.anchorCondition = `WHERE (${queryable.text})`
		return this
	}

	private recursiveCondition?: string
	public thenWhere (initialiser: ExpressionInitialiser<Schema.Columns<TABLE> & Schema.Columns<TABLE, { [KEY in Schema.Column<TABLE>]: `current.${KEY & (string | number)}` }>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars,
			name => this.columnNames.includes(name as Schema.Column<TABLE>) ? `recursive_table.${name}` : name)
		this.recursiveCondition = `WHERE (${queryable.text})`
		return this
	}

	private search?: { columns: Schema.Column<VIRTUAL_TABLE>[], type: SearchType }
	public searchBy (type: SearchType, ...columns: Schema.Column<VIRTUAL_TABLE>[]) {
		this.search = { type, columns }
		return this
	}

	private _orderBy?: Order<VIRTUAL_TABLE>[]
	public orderBy (column: Schema.Column<VIRTUAL_TABLE>, order?: SortDirection): this
	public orderBy (orders: Order<VIRTUAL_TABLE>[]): this
	public orderBy (...args: Order<VIRTUAL_TABLE> | [Order<VIRTUAL_TABLE>[]]) {
		if (Array.isArray(args[0]))
			this._orderBy = args[0]
		else
			this._orderBy = [args as Order<VIRTUAL_TABLE>]
		return this
	}

	protected override selectInitialiser (query: SelectFromVirtualTable<VIRTUAL_TABLE, '*'>) {
		if (this.search)
			query.orderBy([
				['with_recursive_search_order' as Schema.Column<VIRTUAL_TABLE>],
				...this._orderBy ?? [],
			])
	}

	public override compileWith (): string {
		if (!this.recursiveCondition)
			throw new Error('A recursive condition is required')

		const anchorQuery = `SELECT ${this.columnNames.join(',')} FROM ${this.tableName} ${this.anchorCondition ?? ''}`
		const recursiveQuery = `SELECT ${this.columnNames.map(name => `recursive_table.${String(name)}`).join(',')} FROM ${this.tableName} recursive_table, ${this.name} current ${this.recursiveCondition}`
		const searchBy = !this.search?.columns ? '' : `BY ${this.search.columns.map(String).join(',')}`
		const searchQuery = !this.search ? '' : `SEARCH ${this.search.type.description!} FIRST ${searchBy} SET with_recursive_search_order`
		return `RECURSIVE ${this.name}(${this.columnNames.join(',')}) AS (${anchorQuery} UNION ALL ${recursiveQuery}) ${searchQuery}`
	}

}
