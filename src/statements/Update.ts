import type { QueryResult } from 'pg'
import type { InputTypeFromString, OutputTypeFromString, SingleStringUnion, TypeString, ValidType } from '../IStrongPG'
import type { TableSchema } from '../Schema'
import Schema from '../Schema'
import type { ExpressionInitialiser, ExpressionOr } from '../expressions/Expression'
import Expression from '../expressions/Expression'
import type sql from '../sql'
import Statement from './Statement'
import Values from './Values'

export default class UpdateTable<NAME extends string, SCHEMA extends TableSchema, RESULT = number, VARS = {}> extends Statement<RESULT> {

	private vars: any[]
	public constructor (public readonly tableName: NAME, public readonly schema: SCHEMA, vars?: any[]) {
		super()
		this.vars = vars ?? []
	}

	private fromExpr?: sql
	public from<VT_NAME extends string, const COLUMNS extends readonly string[], TYPES extends readonly TypeString[]> (name: VT_NAME, columns: COLUMNS, initialiser: (values: Values<NoInfer<VT_NAME>, NoInfer<COLUMNS>>) => Values<NoInfer<VT_NAME>, NoInfer<COLUMNS>, TYPES>) {
		const values = new Values(name, columns)
		initialiser(values)
		this.fromExpr = values.compile()
		return this as UpdateTable<NAME, SCHEMA, RESULT, VARS
			& { [COLUMN in COLUMNS[number]as `${VT_NAME}.${COLUMN}`]: { [INDEX in keyof COLUMNS as COLUMN extends COLUMNS[INDEX] ? INDEX : never]: InputTypeFromString<TYPES[INDEX & keyof TYPES] & TypeString, VARS> } }
		>
	}

	private assignments: string[] = []
	public set (input: Partial<Schema.RowInput<SCHEMA, VARS & Schema.Columns<SCHEMA>>>): this
	public set<COLUMN_NAME extends Schema.Column<SCHEMA>> (column: COLUMN_NAME, value: InputTypeFromString<SCHEMA[COLUMN_NAME], VARS & Schema.Columns<SCHEMA>>): this
	public set (input: Schema.Column<SCHEMA> | Partial<Schema.RowInput<SCHEMA, VARS & Schema.Columns<SCHEMA>>>, value?: ExpressionOr<VARS & Schema.Columns<SCHEMA>, ValidType>) {
		if (typeof input === 'object') {
			for (const column of Object.keys(input))
				this.set(column as Schema.Column<SCHEMA>, input[column as keyof Schema.RowInput<SCHEMA, VARS & Schema.Columns<SCHEMA>>] as never)
		}
		else {
			if (Schema.isColumn(this.schema, input, 'TIMESTAMP') && typeof value === 'number')
				value = new Date(value)
			this.assignments.push(`${String(input)}=${Expression.stringifyValue(value, this.vars)}`)
		}

		return this
	}

	private condition?: string
	public where (initialiser: ExpressionInitialiser<VARS & Schema.Columns<SCHEMA> & Schema.TableColumns<NAME, SCHEMA>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars)
		this.condition = `WHERE (${queryable.text})`
		return this
	}

	public primaryKeyed (id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>) {
		const primaryKey = Schema.getSingleColumnPrimaryKey(this.schema)
		this.where(expr => expr.var(primaryKey).equals(id as never))
		return this
	}

	private returningColumns?: (Schema.Column<SCHEMA> | '*')[]
	public returning (): UpdateTable<NAME, SCHEMA, number, VARS>
	public returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: RETURNING_COLUMNS): UpdateTable<NAME, SCHEMA, { [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]> }[], VARS>
	public returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | '*'> (columns: RETURNING_COLUMN): UpdateTable<NAME, SCHEMA, { [KEY in RETURNING_COLUMN extends '*' ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]> }[], VARS>
	public returning (...columns: (Schema.Column<SCHEMA> | '*')[]) {
		this.returningColumns = columns
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as UpdateTable<NAME, SCHEMA, any, VARS>
	}

	public compile () {
		const returning = !this.returningColumns?.length ? ''
			: `RETURNING ${this.returningColumns.join(',')}`
		const fromString = this.fromExpr ? `FROM ${this.fromExpr.compile(this.vars)}` : ''
		return this.queryable(`UPDATE ${this.tableName ?? ''} SET ${this.assignments.join(',')} ${fromString} ${this.condition ?? ''} ${returning}`, undefined, this.vars)
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return (!this.returningColumns?.length ? output.rowCount : output.rows) as RESULT
	}

}
