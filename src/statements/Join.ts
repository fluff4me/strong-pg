import type { MakeOptional } from '../IStrongPG'
import type Schema from '../Schema'
import type { DatabaseSchema, TableSchema } from '../Schema'
import { VirtualTable } from '../VirtualTable'
import type { ExpressionInitialiser } from '../expressions/Expression'
import Expression from '../expressions/Expression'

enum JoinType {
	'Inner',
	'Left Outer',
	'Full Outer',
	'Right Outer',
}

type JoinTypeName = Uppercase<keyof typeof JoinType>

export type JoinColumns<TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> =
	Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ?
	Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ?
	Exclude<TABLE1_COLUMNS, TABLE2_COLUMNS> | Exclude<TABLE2_COLUMNS, TABLE1_COLUMNS> extends infer COLUMNS_UNION ?

	| COLUMNS_UNION
	| (TABLE1_NAME extends '' ? never : `${TABLE1_NAME}.${Exclude<TABLE1_COLUMNS, `${string}.${string}`>}`)
	| `${TABLE2_NAME}.${Exclude<TABLE2_COLUMNS, `${string}.${string}`>}`
	| Extract<TABLE1_COLUMNS, `${string}.${string}`>
	| Extract<TABLE2_COLUMNS, `${string}.${string}`>

	: never : never : never

export type JoinTables<TYPE extends JoinTypeName, TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> =
	Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ?
	Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ?
	JoinColumns<TABLE1, TABLE2, TABLE1_NAME, TABLE2_NAME> extends infer COLUMNS extends string ?

	{
		[COLUMN in COLUMNS]:
		| COLUMN extends TABLE1_COLUMNS ? (TYPE extends 'RIGHT OUTER' | 'FULL OUTER' ? MakeOptional<TABLE1[COLUMN]> : TABLE1[COLUMN])
		: COLUMN extends TABLE2_COLUMNS ? (TYPE extends 'LEFT OUTER' | 'FULL OUTER' ? MakeOptional<TABLE2[COLUMN]> : TABLE2[COLUMN])
		: COLUMN extends `${TABLE1_NAME}.${infer BASENAME extends TABLE1_COLUMNS}` ? (TYPE extends 'RIGHT OUTER' | 'FULL OUTER' ? MakeOptional<TABLE1[BASENAME]> : TABLE1[BASENAME])
		: COLUMN extends `${TABLE2_NAME}.${infer BASENAME extends TABLE2_COLUMNS}` ? (TYPE extends 'LEFT OUTER' | 'FULL OUTER' ? MakeOptional<TABLE2[BASENAME]> : TABLE2[BASENAME])
		: never
	}

	: never
	: never
	: never

export default class Join<DATABASE extends DatabaseSchema, VIRTUAL_TABLE extends TableSchema, TYPE extends JoinTypeName> extends VirtualTable<VIRTUAL_TABLE, never> {

	public constructor (private readonly type: TYPE, private readonly table1: string | Join<DATABASE, any, JoinTypeName>, private readonly table2: string, private readonly alias1?: string, private readonly alias2?: string, vars?: any[]) {
		super(`vt_join_${typeof table1 === 'string' ? table1 : table1.name}_${table2}` as never, vars)
	}

	private condition?: string
	public on (initialiser: ExpressionInitialiser<Schema.Columns<VIRTUAL_TABLE>, boolean>) {
		const queryable = Expression.compile(initialiser, undefined, this.vars)
		this.condition = `ON (${queryable.text})`
		return this
	}

	public innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<'INNER', VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, '', TABLE2_ALIAS>, 'INNER'>('INNER', this, tableName, undefined, alias, this.vars)
	}

	public leftOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<'LEFT OUTER', VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, '', TABLE2_ALIAS>, 'LEFT OUTER'>('LEFT OUTER', this, tableName, undefined, alias, this.vars)
	}

	public rightOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<'RIGHT OUTER', VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, '', TABLE2_ALIAS>, 'RIGHT OUTER'>('RIGHT OUTER', this, tableName, undefined, alias, this.vars)
	}

	public fullOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<'FULL OUTER', VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, '', TABLE2_ALIAS>, 'FULL OUTER'>('FULL OUTER', this, tableName, undefined, alias, this.vars)
	}

	public override compileFrom (): string {
		if (this.type !== 'INNER' && !this.condition)
			throw new Error(`Unable to join ${typeof this.table1 === 'string' ? this.table1 : '(joined table)'} and ${this.table2}, no ON expression provided`)

		const type = this.type === 'INNER' && !this.condition ? 'CROSS' : this.type
		const table1 = typeof this.table1 === 'string' ? `${this.table1 ?? ''} ${this.alias1 ?? ''}`
			: this.table1.compileFrom()

		return `${table1} ${type} JOIN ${this.table2} ${this.alias2 ?? ''} ${this.condition ?? ''}`
	}

}
