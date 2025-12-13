import type Database from '../Database'
import { sql } from '../Database'
import type { Initialiser, MigrationTypeFromString, OptionalTypeString, ValidDate, ValidLiteral, ValidType } from '../IStrongPG'
import { DataType, TypeString } from '../IStrongPG'
import type { DatabaseSchema, TableSchema } from '../Schema'
import type { JoinTables } from '../statements/Join'
import type { SelectFromVirtualTable } from '../statements/Select'
import Statement from '../statements/Statement'
import type Table from '../Table'
import type { VirtualTable } from '../VirtualTable'

export interface ExpressionOperations<VARS = never, CURRENT_VALUE = null> {
	greaterThan: CURRENT_VALUE extends ValidDate ? ExpressionValue<VARS, ValidDate, boolean>
	: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never
	greaterThanOrEquals: CURRENT_VALUE extends ValidDate ? ExpressionValue<VARS, ValidDate, boolean>
	: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never
	lessThan: CURRENT_VALUE extends ValidDate ? ExpressionValue<VARS, ValidDate, boolean>
	: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never
	lessThanOrEquals: CURRENT_VALUE extends ValidDate ? ExpressionValue<VARS, ValidDate, boolean>
	: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never
	isNull (): ExpressionOperations<VARS, boolean>
	isNotNull (): ExpressionOperations<VARS, boolean>
	equals: ExpressionValue<VARS, CURRENT_VALUE, boolean>
	notEquals: ExpressionValue<VARS, CURRENT_VALUE, boolean>
	or: ExpressionValueAddBooleanExpr<VARS>
	and: ExpressionValueAddBooleanExpr<VARS>
	matches: CURRENT_VALUE extends string ? ExpressionValue<VARS, RegExp, boolean> : never
	as<TYPE extends TypeString> (type: TYPE): ExpressionOperations<VARS, MigrationTypeFromString<TYPE>>
	asEnum<SCHEMA extends DatabaseSchema> (enumName: DatabaseSchema.EnumName<SCHEMA>): ExpressionOperations<VARS, CURRENT_VALUE>
	add: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never
	subtract: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never
	multipliedBy: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never
	dividedBy: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never
}

export interface ExpressionValue<VARS = never, EXPECTED_VALUE = null, RESULT = null> {
	<VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)> (value: ExpressionOr<VARS, VALUE>): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>
}

export interface ExpressionValueAddBooleanExpr<VARS = never> {
	(value?: ExpressionOr<VARS, boolean>): ExpressionOperations<VARS, boolean>
}

export interface ExpressionCase<VARS = never, RESULT = null> {
	when (value: ExpressionOr<VARS, boolean>): ExpressionCaseWhen<VARS, RESULT>
	otherwise (value: ExpressionOr<VARS, RESULT>): ExpressionCase<VARS, RESULT>
}

export interface ExpressionCaseWhen<VARS = never, RESULT = null> {
	then (value: ExpressionOr<VARS, RESULT>): ExpressionCase<VARS, RESULT>
}

type Pick2<T, K> = { [KEY in keyof T as KEY extends K ? KEY : never]: T[KEY] }

export interface ExpressionValues<VARS = never, VALUE = null, RESULT = null> {
	case<R extends ValidType> (initialiser: Initialiser<ExpressionCase<VARS, R>, ExpressionCase<VARS, R> | ExpressionCase<VARS, R>[]>): ExpressionOperations<VARS, R>
	some<T> (values: T[], predicate: (e: ExpressionValues<VARS, null, boolean>, value: T, index: number, values: T[]) => ExpressionOperations<VARS, boolean>): ExpressionOperations<VARS, boolean>
	every<T> (values: T[], predicate: (e: ExpressionValues<VARS, null, boolean>, value: T, index: number, values: T[]) => ExpressionOperations<VARS, boolean>): ExpressionOperations<VARS, boolean>
	value: ExpressionValue<VARS, VALUE, RESULT>
	jsonb (value: ValidLiteral | object): ExpressionOperations<VARS, object>
	var<VAR extends keyof VARS> (name: VAR): ExpressionOperations<VARS, MigrationTypeFromString<Extract<VARS[VAR], TypeString | OptionalTypeString>>>
	lowercase: ExpressionValue<VARS, string, string>
	uppercase: ExpressionValue<VARS, string, string>
	nextValue (sequenceId: string): ExpressionOperations<VARS, number>
	currentValue (sequenceId: string): ExpressionOperations<VARS, number>
	true: ExpressionOperations<VARS, boolean>
	false: ExpressionOperations<VARS, boolean>
	exists<DATABASE_SCHEMA extends DatabaseSchema, TABLE extends DatabaseSchema.TableName<DATABASE_SCHEMA>> (database: Database<DATABASE_SCHEMA>, table: TABLE, initialiser: NoInfer<Initialiser<SelectFromVirtualTable<JoinTables<'INNER', Extract<VARS, TableSchema>, DatabaseSchema.Table<DATABASE_SCHEMA, TABLE>, never, TABLE>, never, 1>>>): ExpressionOperations<VARS, boolean>
	exists<DATABASE_SCHEMA extends DatabaseSchema, TABLE_NAME extends DatabaseSchema.TableName<DATABASE_SCHEMA>, const VTABLE> (database: Database<DATABASE_SCHEMA>, table: TABLE_NAME, tableInitialiser: Initialiser<NoInfer<Table<DatabaseSchema.Table<DATABASE_SCHEMA, TABLE_NAME>, DATABASE_SCHEMA, TABLE_NAME>>, VTABLE>, initialiser: NoInfer<Initialiser<SelectFromVirtualTable<JoinTables<'INNER', Extract<VARS, TableSchema>, VTABLE extends VirtualTable<infer TABLE, any> ? Pick2<TABLE, `${string}.${string}`> : never, never, TABLE_NAME>, never, 1>>>): ExpressionOperations<VARS, boolean>
	notExists<DATABASE_SCHEMA extends DatabaseSchema, TABLE extends DatabaseSchema.TableName<DATABASE_SCHEMA>> (database: Database<DATABASE_SCHEMA>, table: TABLE, initialiser: NoInfer<Initialiser<SelectFromVirtualTable<JoinTables<'INNER', Extract<VARS, TableSchema>, DatabaseSchema.Table<DATABASE_SCHEMA, TABLE>, never, TABLE>, never, 1>>>): ExpressionOperations<VARS, boolean>
	notExists<DATABASE_SCHEMA extends DatabaseSchema, TABLE_NAME extends DatabaseSchema.TableName<DATABASE_SCHEMA>, const VTABLE> (database: Database<DATABASE_SCHEMA>, table: TABLE_NAME, tableInitialiser: Initialiser<NoInfer<Table<DatabaseSchema.Table<DATABASE_SCHEMA, TABLE_NAME>, DATABASE_SCHEMA, TABLE_NAME>>, VTABLE>, initialiser: NoInfer<Initialiser<SelectFromVirtualTable<JoinTables<'INNER', Extract<VARS, TableSchema>, VTABLE extends VirtualTable<infer TABLE, any> ? Pick2<TABLE, `${string}.${string}`> : never, never, TABLE_NAME>, never, 1>>>): ExpressionOperations<VARS, boolean>
	coalesce<R extends ValidType> (...values: ExpressionOr<VARS, R>[]): ExpressionOperations<VARS, R>
}

export type ExpressionInitialiser<VARS, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>

export type ExpressionOr<VARS, T> = sql | T | ExpressionInitialiser<VARS, T> | ExpressionOperations<any, T>

export type ImplementableExpression = { [KEY in keyof ExpressionValues | keyof ExpressionOperations]: any }

export default class Expression<VARS = never> implements ImplementableExpression {

	public static stringifyValue<VARS = never> (value: ExpressionOr<VARS, ValidType>, vars: any[], enableStringConcatenation = false) {
		if (typeof value === 'function') {
			let expr = new Expression(vars, enableStringConcatenation)

			const result = value(expr as any as ExpressionValues<VARS, null, null>)
			if (result instanceof Expression && result !== expr)
				expr = result

			return `(${expr.compile()})`
		}

		if (value instanceof Expression) {
			return `(${value.compile()})`
		}

		if (sql.is(value))
			return value.compile(vars)

		const shouldPassAsVariable = false
			|| (typeof value === 'string' && !enableStringConcatenation)
			|| (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof RegExp))
		if (!shouldPassAsVariable)
			return Expression.stringifyValueRaw(value)

		const index = vars.indexOf(value)
		if (index !== undefined && index !== -1)
			// already in vars
			return `$${index + 1}`

		vars.push(value)
		return `$${vars.length}`
	}

	/**
	 * Warning: Do not use outside of migrations
	 */
	public static stringifyValueRaw (value: ValidType) {
		switch (typeof value) {
			case 'string':
				return `'${value}'`

			case 'symbol':
				return value.description!

			case 'boolean':
				return value ? 'TRUE' : 'FALSE'

			case 'undefined':
				return 'NULL'

			case 'object':
				if (value === null)
					return 'NULL'
				else if (value instanceof RegExp)
					return `'${value.source.replace(/'/g, '\'\'')}'`
				else if (sql.is(value))
					return value.text
				else
					return `'${(value as Date).toISOString()}'`

			case 'number':
				return `${value}`
		}
	}

	public static compile (initialiser: ExpressionInitialiser<any, any>, enableStringConcatenation = false, vars?: any[], varMapper?: (varName: string) => string) {
		let expr = new Expression(vars ?? [], enableStringConcatenation)

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const result = initialiser(expr as any)
		if (result instanceof Expression && result !== expr)
			expr = result

		return new Statement.Queryable(expr.compile(varMapper), undefined, expr.vars)
	}

	public readonly parts: ((varMapper?: (varName: string) => string) => string)[] = []

	private constructor (public vars: any[], private readonly enableStringConcatenation = false) { }

	public compile (varMapper?: (varName: string) => string) {
		return this.parts.map(part => part(varMapper)).join('')
	}

	////////////////////////////////////
	// Operations

	public greaterThan (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' > ')
		return this.innerValue(value)
	}

	public lessThan (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' < ')
		return this.innerValue(value)
	}

	public greaterThanOrEquals (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' >= ')
		return this.innerValue(value)
	}

	public lessThanOrEquals (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' <= ')
		return this.innerValue(value)
	}

	public matches (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' ~ ')
		return this.innerValue(value)
	}

	public isNull () {
		this.parts.push(() => ' IS NULL')
		return this
	}

	public isNotNull () {
		this.parts.push(() => ' IS NOT NULL')
		return this
	}

	public or (value?: ExpressionOr<VARS, boolean>) {
		if (value === undefined)
			return this

		this.parts.push(() => ' OR ')
		return this.innerValue(value)
	}

	public and (value?: ExpressionOr<VARS, boolean>) {
		if (value === undefined)
			return this

		this.parts.push(() => ' AND ')
		return this.innerValue(value)
	}

	public equals (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' = ')
		return this.innerValue(value)
	}

	public notEquals (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' != ')
		return this.innerValue(value)
	}

	public as (type: TypeString) {
		this.parts.push(() => ` :: ${TypeString.resolve(type)}`)
		return this
	}

	public asEnum<SCHEMA extends DatabaseSchema> (enumName: DatabaseSchema.EnumName<SCHEMA>) {
		this.parts.push(() => ` :: ${enumName}`)
		return this
	}

	public add (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' + ')
		return this.innerValue(value)
	}

	public subtract (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' - ')
		return this.innerValue(value)
	}

	public multipliedBy (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' * ')
		return this.innerValue(value)
	}

	public dividedBy (value: ExpressionOr<VARS, ValidType>) {
		this.parts.push(() => ' / ')
		return this.innerValue(value)
	}

	////////////////////////////////////
	// Values

	public get true () {
		this.parts.push(() => '1=1')
		return this
	}

	public get false () {
		this.parts.push(() => '1=0')
		return this
	}

	public case<R extends ValidType> (initialiser: Initialiser<ExpressionCase<VARS, R>, ExpressionCase<VARS, R>[]>) {
		type When = [ExpressionOr<VARS, boolean> | undefined, ExpressionOr<VARS, R>]
		const whens: When[] = []
		let when: When | undefined
		const builder: ExpressionCase<VARS, R> & ExpressionCaseWhen<VARS, R> = {
			when: value => {
				when = [value, undefined!]
				return builder
			},
			otherwise: value => {
				whens.push([undefined, value])
				return builder
			},
			then: value => {
				if (!when) throw new Error('Cannot add \'then\' value to no \'when\' expression')
				when[1] = value
				whens.push(when)
				when = undefined
				return builder
			},
		}
		initialiser(builder)
		this.parts.push(() => {
			const whensString = whens
				.map(([when, then]) => {
					const whenString = when === undefined ? undefined : Expression.stringifyValue(when, this.vars, this.enableStringConcatenation)
					const thenString = Expression.stringifyValue(then, this.vars, this.enableStringConcatenation)
					return whenString === undefined
						? `ELSE (${thenString})`
						: `WHEN (${whenString}) THEN (${thenString})`
				})
				.join(' ')

			return `CASE ${whensString} END`
		})
		return this
	}

	public some (values: any[], predicate: (e: ExpressionValues, value: any, index: number, values: any[]) => any) {
		const e = new Expression(this.vars, this.enableStringConcatenation)
		e.parts.push(() => values
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			.map((value, i) => Expression.stringifyValue(expression => predicate(expression, value, i, values), this.vars, this.enableStringConcatenation))
			.join(' OR '))
		return e
	}

	public every (values: any[], predicate: (e: ExpressionValues, value: any, index: number, values: any[]) => any) {
		const e = new Expression(this.vars, this.enableStringConcatenation)
		e.parts.push(() => values
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			.map((value, i) => Expression.stringifyValue(expression => predicate(expression, value, i, values), this.vars, this.enableStringConcatenation))
			.join(' AND '))
		return e
	}

	private innerValue (value: ExpressionOr<VARS, ValidType>, mapper?: (value: string) => string) {
		if (value as never === this)
			return this

		this.parts.push(() => {
			const stringified = Expression.stringifyValue(value as ValidType | ExpressionInitialiser<VARS>, this.vars, this.enableStringConcatenation)
			return mapper ? mapper(stringified) : stringified
		})
		return this
	}

	public value (value: ExpressionOr<VARS, ValidType>, mapper?: (value: string) => string) {
		return new Expression(this.vars, this.enableStringConcatenation)
			.innerValue(value as never, mapper)
	}

	public jsonb (value: ValidLiteral | object) {
		return new Expression(this.vars, this.enableStringConcatenation)
			.innerValue(JSON.stringify(value) as never)
			.as(DataType.JSONB)
	}

	public var (name: keyof VARS) {
		const e = new Expression(this.vars, this.enableStringConcatenation)
		e.parts.push((varMapper?: (name: string) => string) => varMapper?.(name as string) ?? name as string)
		return e
	}

	public lowercase (value: ExpressionOr<VARS, string>) {
		return this.value(value, value => `lower(${value})`)
	}

	public uppercase (value: ExpressionOr<VARS, string>) {
		return this.value(value, value => `upper(${value})`)
	}

	public nextValue (sequenceId: string) {
		this.parts.push(() => `nextval('${sequenceId}')`)
		return this
	}

	public currentValue (sequenceId: string) {
		this.parts.push(() => `currval('${sequenceId}')`)
		return this
	}

	public exists (database: Database<any>, tableName: string, tableInitialiser?: Initialiser<SelectFromVirtualTable<any, string, 1>> | Initialiser<Table<any, any, string>, VirtualTable<any, never>>, initialiser?: Initialiser<SelectFromVirtualTable<any, string, 1>>) {
		if (!initialiser) {
			initialiser = tableInitialiser as never
			tableInitialiser = undefined
		}

		let table = database.table(tableName)
		if (tableInitialiser)
			table = tableInitialiser(table as never)

		const select = table.select(1)
		select['vars'] = this.vars
		initialiser(select as never)
		const e = new Expression(this.vars, this.enableStringConcatenation)
		e.parts.push(() => `EXISTS (${select.compile()[0].text})`)
		return e
	}

	public notExists (database: Database<any>, tableName: string, tableInitialiser?: Initialiser<SelectFromVirtualTable<any, string, 1>> | Initialiser<Table<any, any, string>, VirtualTable<any, never>>, initialiser?: Initialiser<SelectFromVirtualTable<any, string, 1>>) {
		if (!initialiser) {
			initialiser = tableInitialiser as never
			tableInitialiser = undefined
		}

		let table = database.table(tableName)
		if (tableInitialiser)
			table = tableInitialiser(table as never)

		const select = table.select(1)
		select['vars'] = this.vars
		initialiser(select as never)
		const e = new Expression(this.vars, this.enableStringConcatenation)
		e.parts.push(() => `NOT EXISTS (${select.compile()[0].text})`)
		return e
	}

	public coalesce (...values: ExpressionOr<VARS, ValidType>[]) {
		this.parts.push(() => {
			const valuesString = values
				.map(value => Expression.stringifyValue(value, this.vars, this.enableStringConcatenation))
				.join(',')

			return `COALESCE(${valuesString})`
		})
		return this
	}

}
