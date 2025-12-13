import type { Initialiser } from './IStrongPG'
import type Schema from './Schema'
import type { TableSchema } from './Schema'
import type { SelectColumnsRecord } from './statements/Select'
import { SelectFromVirtualTable } from './statements/Select'

export abstract class VirtualTable<VIRTUAL_TABLE extends TableSchema, NAME extends string> {

	public constructor (protected readonly name: NAME, protected vars: any[] = []) {
	}

	/**
	 * SELECT *
	 */
	public select (): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>
	/**
	 * SELECT columns AS aliases
	 */
	public select<const COLUMNS extends SelectColumnsRecord<VIRTUAL_TABLE, NAME>> (columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>
	/**
	 * SELECT columns
	 */
	public select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]> (...columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>
	/**
	 * SELECT *
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'> = SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>> (initialiser: Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>, RETURN>): RETURN
	/**
	 * SELECT columns
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME, COLUMNS>, RETURN>]): RETURN
	public select (...params: (Partial<Record<Schema.Column<VIRTUAL_TABLE>, string>> | Schema.Column<VIRTUAL_TABLE> | '*' | Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME>> | Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'>>)[]): SelectFromVirtualTable<VIRTUAL_TABLE, NAME, any> | SelectFromVirtualTable<VIRTUAL_TABLE, NAME, '*'> {
		const initialiser = typeof params[params.length - 1] === 'function' ? params.pop() as Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, NAME>> : undefined

		const input =
			params.length === 0 ? '*'
				: params.length === 1 && typeof params[0] === 'object' ? params[0]
					: params as Schema.Column<VIRTUAL_TABLE>[]

		const query = new SelectFromVirtualTable(this, input as never)

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.selectInitialiser?.(query as any)

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return initialiser?.(query as any) ?? query
	}

	public compileWith?(): string
	public compileFrom?(): string

	protected selectInitialiser?(select: SelectFromVirtualTable<VIRTUAL_TABLE, '*'>): any

}
