import { Initialiser } from "./IStrongPG";
import Schema, { TableSchema } from "./Schema";
import InsertIntoTable, { InsertIntoTableFactory } from "./statements/Insert";
import SelectFromTable from "./statements/Select";
import UpdateTable from "./statements/Update";

export default class Table<SCHEMA extends TableSchema> {
	public constructor (protected readonly name: string, protected readonly schema: SCHEMA) {
	}

	/**
	 * SELECT *
	 */
	public select (): SelectFromTable<SCHEMA, "*"[]>;
	/**
	 * SELECT columns
	 */
	public select<COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: COLUMNS): SelectFromTable<SCHEMA, COLUMNS>;
	/**
	 * SELECT *
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromTable<SCHEMA, "*"[], any> = SelectFromTable<SCHEMA, "*"[]>> (initialiser: Initialiser<SelectFromTable<SCHEMA, "*"[]>, RETURN>): RETURN;
	/**
	 * SELECT columns
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<COLUMNS extends Schema.Column<SCHEMA>[], RETURN extends SelectFromTable<SCHEMA, COLUMNS, any>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<SCHEMA, COLUMNS>, RETURN>]): RETURN;
	public select (...params: (Schema.Column<SCHEMA> | "*" | Initialiser<SelectFromTable<SCHEMA>> | Initialiser<SelectFromTable<SCHEMA, "*"[]>>)[]): SelectFromTable<SCHEMA, Schema.Column<SCHEMA>[]> | SelectFromTable<SCHEMA, "*"[]> {
		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<SelectFromTable<SCHEMA>> : undefined;
		if (params.length === 0)
			params.push("*");

		const query = new SelectFromTable<SCHEMA>(this.name, this.schema, params as Schema.Column<SCHEMA>[]);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return initialiser?.(query) ?? query;
	}

	public insert (data: Partial<Schema.RowInput<SCHEMA>>): InsertIntoTable<SCHEMA>;
	public insert (data: Partial<Schema.RowInput<SCHEMA>>, initialiser: Initialiser<InsertIntoTable<SCHEMA>>): InsertIntoTable<SCHEMA>;
	public insert<COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: COLUMNS): InsertIntoTableFactory<SCHEMA, COLUMNS>;
	public insert<COLUMNS extends Schema.Column<SCHEMA>[], RETURN extends InsertIntoTableFactory<SCHEMA, COLUMNS> | InsertIntoTable<SCHEMA>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<SCHEMA, COLUMNS>, RETURN>]): RETURN;
	public insert (...params: (boolean | Partial<Schema.RowInput<SCHEMA>> | Schema.Column<SCHEMA> | Initialiser<InsertIntoTableFactory<SCHEMA>> | Initialiser<InsertIntoTable<SCHEMA>>)[]): InsertIntoTableFactory<SCHEMA> | InsertIntoTable<SCHEMA> {
		const isUpsert = params[0] === true;
		if (typeof params[0] === "boolean")
			params.shift();

		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<InsertIntoTableFactory<SCHEMA> | InsertIntoTable<SCHEMA>> : undefined;

		if (typeof params[0] === "object") {
			const keys = Object.keys(params[0]);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			const query = ((this.insert as any)(isUpsert as any, ...keys as Schema.Column<SCHEMA>[]) as InsertIntoTableFactory<SCHEMA>)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
				.values(...keys.map(key => (params[0] as any)[key]));

			return initialiser?.(query as InsertIntoTable<SCHEMA>) as InsertIntoTable<SCHEMA> ?? query;
		}

		const query = InsertIntoTable.columns<SCHEMA>(this.name, this.schema, params as Schema.Column<SCHEMA>[], isUpsert);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return initialiser?.(query) ?? query;
	}

	public upsert (data: Schema.RowInput<SCHEMA>): InsertIntoTable<SCHEMA>;
	public upsert<RETURN extends InsertIntoTable<SCHEMA, any>> (data: Schema.RowInput<SCHEMA>, initialiser: Initialiser<InsertIntoTable<SCHEMA>, RETURN>): RETURN;
	public upsert<COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: COLUMNS): InsertIntoTableFactory<SCHEMA, COLUMNS>;
	public upsert<COLUMNS extends Schema.Column<SCHEMA>[], RETURN extends InsertIntoTableFactory<SCHEMA, COLUMNS> | InsertIntoTable<SCHEMA>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<SCHEMA, COLUMNS>, RETURN>]): RETURN;
	public upsert (...params: (Schema.RowInput<SCHEMA> | Schema.Column<SCHEMA> | Initialiser<InsertIntoTableFactory<SCHEMA>> | Initialiser<InsertIntoTable<SCHEMA>>)[]): InsertIntoTableFactory<SCHEMA> | InsertIntoTable<SCHEMA> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		return (this.insert as any)(true, ...params as Schema.Column<SCHEMA>[]);
	}

	public update (data: Schema.RowInput<SCHEMA>): UpdateTable<SCHEMA>;
	public update<RETURN extends UpdateTable<SCHEMA, any>> (data: Schema.RowInput<SCHEMA>, initialiser: Initialiser<UpdateTable<SCHEMA>, RETURN>): RETURN;
	public update (data: Schema.RowInput<SCHEMA>, initialiser?: Initialiser<UpdateTable<SCHEMA>, UpdateTable<SCHEMA, any>>): UpdateTable<SCHEMA, any> {
		const query = new UpdateTable<SCHEMA, any>(this.name, this.schema);
		for (const key of Object.keys(data))
			query.set(key as Schema.Column<SCHEMA>, data[key]);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return initialiser?.(query) ?? query;
	}
}
