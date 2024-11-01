import { Initialiser } from "./IStrongPG";
import Schema, { TableSchema } from "./Schema";
import { SelectFromVirtualTable } from "./statements/Select";

export abstract class VirtualTable<VIRTUAL_TABLE extends TableSchema> {

	public constructor (protected readonly name: string, protected vars: any[] = []) {
	}

	/**
	 * SELECT *
	 */
	public select (): SelectFromVirtualTable<VIRTUAL_TABLE, "*">;
	/**
	 * SELECT columns AS aliases
	 */
	public select<COLUMNS extends Partial<Record<Schema.Column<VIRTUAL_TABLE>, string>>> (columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>;
	/**
	 * SELECT columns
	 */
	public select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]> (...columns: COLUMNS): SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>;
	/**
	 * SELECT *
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, "*"> = SelectFromVirtualTable<VIRTUAL_TABLE, "*">> (initialiser: Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, "*">, RETURN>): RETURN;
	/**
	 * SELECT columns
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, COLUMNS>, RETURN>]): RETURN;
	public select (...params: (Partial<Record<Schema.Column<VIRTUAL_TABLE>, string>> | Schema.Column<VIRTUAL_TABLE> | "*" | Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE>> | Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE, "*">>)[]): SelectFromVirtualTable<VIRTUAL_TABLE, any> | SelectFromVirtualTable<VIRTUAL_TABLE, "*"> {
		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<SelectFromVirtualTable<VIRTUAL_TABLE>> : undefined;

		const input =
			params.length === 0 ? "*"
				: params.length === 1 && typeof params[0] === "object" ? params[0]
					: params as Schema.Column<VIRTUAL_TABLE>[];

		const query = new SelectFromVirtualTable(this, input)

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.selectInitialiser?.(query as any)

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return initialiser?.(query as any) ?? query;
	}

	public compileWith?(): string
	public compileFrom?(): string

	protected selectInitialiser?(select: SelectFromVirtualTable<VIRTUAL_TABLE, "*">): any
}
