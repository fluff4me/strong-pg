import { Initialiser } from "./IStrongPG";
import Schema, { TableSchema } from "./Schema";
import SelectFromTable from "./statements/Select";

export default class Table<SCHEMA extends TableSchema> {
	public constructor (protected readonly name: string, protected readonly schema: SCHEMA) {
	}

	public select<COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: COLUMNS): SelectFromTable<SCHEMA, COLUMNS>;
	public select<COLUMNS extends Schema.Column<SCHEMA>[]> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<SCHEMA, COLUMNS>>]): SelectFromTable<SCHEMA, COLUMNS>;
	public select (...params: (Schema.Column<SCHEMA> | Initialiser<SelectFromTable<SCHEMA>>)[]) {
		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<SelectFromTable<SCHEMA>> : undefined;
		const query = new SelectFromTable<SCHEMA>(this.name, this.schema, params as Schema.Column<SCHEMA>[]);
		initialiser?.(query);
		return query;
	}
}
