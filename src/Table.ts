import { Initialiser } from "./IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "./Schema";
import DeleteFromTable from "./statements/Delete";
import InsertIntoTable, { InsertIntoTableFactory } from "./statements/Insert";
import Join, { JoinTables } from "./statements/Join";
import SelectFromTable from "./statements/Select";
import TruncateTable from "./statements/Truncate";
import UpdateTable from "./statements/Update";

export default class Table<TABLE extends TableSchema, DATABASE extends DatabaseSchema, NAME extends DatabaseSchema.TableName<DATABASE>> {
	public constructor (protected readonly name: NAME, protected readonly schema: TABLE) {
	}

	/**
	 * SELECT *
	 */
	public select (): SelectFromTable<TABLE, "*"[]>;
	/**
	 * SELECT columns
	 */
	public select<COLUMNS extends Schema.Column<TABLE>[]> (...columns: COLUMNS): SelectFromTable<TABLE, COLUMNS>;
	/**
	 * SELECT *
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromTable<TABLE, "*"[], any> = SelectFromTable<TABLE, "*"[]>> (initialiser: Initialiser<SelectFromTable<TABLE, "*"[]>, RETURN>): RETURN;
	/**
	 * SELECT columns
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<COLUMNS extends Schema.Column<TABLE>[], RETURN extends SelectFromTable<TABLE, COLUMNS, any>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<TABLE, COLUMNS>, RETURN>]): RETURN;
	public select (...params: (Schema.Column<TABLE> | "*" | Initialiser<SelectFromTable<TABLE>> | Initialiser<SelectFromTable<TABLE, "*"[]>>)[]): SelectFromTable<TABLE, Schema.Column<TABLE>[]> | SelectFromTable<TABLE, "*"[]> {
		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<SelectFromTable<TABLE>> : undefined;
		if (params.length === 0)
			params.push("*");

		const query = new SelectFromTable<TABLE>(this.name, this.schema, params as Schema.Column<TABLE>[]);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return initialiser?.(query) ?? query;
	}

	public insert<COLUMNS extends Schema.Column<TABLE>[]> (...columns: COLUMNS): InsertIntoTableFactory<TABLE, COLUMNS>;
	public insert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, COLUMNS> | InsertIntoTable<TABLE>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, COLUMNS>, RETURN>]): RETURN;
	public insert (data: Partial<Schema.RowInput<TABLE>>): InsertIntoTable<TABLE>;
	public insert (data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<InsertIntoTable<TABLE>>): InsertIntoTable<TABLE>;
	public insert (...params: (boolean | Partial<Schema.RowInput<TABLE>> | Schema.Column<TABLE> | Initialiser<InsertIntoTableFactory<TABLE>> | Initialiser<InsertIntoTable<TABLE>>)[]): InsertIntoTableFactory<TABLE> | InsertIntoTable<TABLE> {
		const isUpsert = params[0] === true;
		if (typeof params[0] === "boolean")
			params.shift();

		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<InsertIntoTableFactory<TABLE> | InsertIntoTable<TABLE>> : undefined;

		if (typeof params[0] === "object") {
			const keys = Object.keys(params[0]);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			const query = ((this.insert as any)(isUpsert as any, ...keys as Schema.Column<TABLE>[]) as InsertIntoTableFactory<TABLE>)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
				.values(...keys.map(key => (params[0] as any)[key]));

			return initialiser?.(query) as InsertIntoTable<TABLE> ?? query;
		}

		const query = InsertIntoTable.columns<TABLE>(this.name, this.schema, params as Schema.Column<TABLE>[], isUpsert);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return initialiser?.(query) ?? query;
	}

	public upsert (data: Schema.RowInput<TABLE>): InsertIntoTable<TABLE>;
	public upsert<RETURN extends InsertIntoTable<TABLE, any>> (data: Schema.RowInput<TABLE>, initialiser: Initialiser<InsertIntoTable<TABLE>, RETURN>): RETURN;
	public upsert<COLUMNS extends Schema.Column<TABLE>[]> (...columns: COLUMNS): InsertIntoTableFactory<TABLE, COLUMNS>;
	public upsert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, COLUMNS> | InsertIntoTable<TABLE>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, COLUMNS>, RETURN>]): RETURN;
	public upsert (...params: (Schema.RowInput<TABLE> | Schema.Column<TABLE> | Initialiser<InsertIntoTableFactory<TABLE>> | Initialiser<InsertIntoTable<TABLE>>)[]): InsertIntoTableFactory<TABLE> | InsertIntoTable<TABLE> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		return (this.insert as any)(true, ...params as Schema.Column<TABLE>[]);
	}

	public update (): UpdateTable<TABLE>;
	public update (data: Partial<Schema.RowInput<TABLE>>): UpdateTable<TABLE>;
	public update<RETURN extends UpdateTable<TABLE, any>> (data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<UpdateTable<TABLE>, RETURN>): RETURN;
	public update (data?: Partial<Schema.RowInput<TABLE>>, initialiser?: Initialiser<UpdateTable<TABLE>, UpdateTable<TABLE, any>>): UpdateTable<TABLE, any> {
		const query = new UpdateTable<TABLE, any>(this.name, this.schema);
		if (data)
			for (const key of Object.keys(data))
				if (data[key as keyof Schema.RowInput<TABLE>] !== undefined)
					query.set(key as Schema.Column<TABLE>, data[key as keyof Schema.RowInput<TABLE>] as never);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return initialiser?.(query) ?? query;
	}

	public delete (): DeleteFromTable<TABLE>;
	public delete<RETURN extends DeleteFromTable<TABLE, any> = DeleteFromTable<TABLE>> (initialiser: Initialiser<DeleteFromTable<TABLE>, RETURN>): RETURN;
	public delete (initialiser?: Initialiser<DeleteFromTable<TABLE>, any>) {
		const query = new DeleteFromTable<TABLE, any>(this.name, this.schema);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return initialiser?.(query) ?? query;
	}

	public truncate () {
		return new TruncateTable(this.name);
	}

	public as<TABLE1_ALIAS extends string> (alias1: TABLE1_ALIAS) {
		return {
			innerJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"INNER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "INNER"> => {
				return new Join("INNER", this.name, tableName, alias1, alias2);
			},
			leftOuterJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"LEFT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "LEFT OUTER"> => {
				return new Join("LEFT OUTER", this.name, tableName, alias1, alias2);
			},
			rightOuterJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"RIGHT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "RIGHT OUTER"> => {
				return new Join("RIGHT OUTER", this.name, tableName, alias1, alias2);
			},
			fullOuterJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"FULL OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "FULL OUTER"> => {
				return new Join("FULL OUTER", this.name, tableName, alias1, alias2);
			},
		}
	}

	public innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<"INNER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "INNER">("INNER", this.name, tableName, undefined, alias);
	}

	public leftOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<"LEFT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "LEFT OUTER">("LEFT OUTER", this.name, tableName, undefined, alias);
	}

	public rightOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<"RIGHT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "RIGHT OUTER">("RIGHT OUTER", this.name, tableName, undefined, alias);
	}

	public fullOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME> (tableName: TABLE2_NAME, alias?: TABLE2_ALIAS) {
		return new Join<DATABASE, JoinTables<"FULL OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "FULL OUTER">("FULL OUTER", this.name, tableName, undefined, alias);
	}
}
