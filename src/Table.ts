import { Initialiser, ValidType } from "./IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "./Schema";
import DeleteFromTable from "./statements/Delete";
import InsertIntoTable, { InsertIntoTableFactory } from "./statements/Insert";
import Join, { JoinTables } from "./statements/Join";
import Recursive from "./statements/Recursive";
import SelectFromTable, { SelectColumnsRecord } from "./statements/Select";
import TruncateTable from "./statements/Truncate";
import UpdateTable from "./statements/Update";

export default class Table<TABLE extends TableSchema, DATABASE extends DatabaseSchema, NAME extends DatabaseSchema.TableName<DATABASE>> {
	public constructor (protected readonly name: NAME, protected readonly schema: TABLE) {
	}
	/**
	 * SELECT 1
	 */
	public select (): SelectFromTable<TABLE, NAME, 1>;
	/**
	 * SELECT *
	 */
	public select (column: "*"): SelectFromTable<TABLE, NAME, "*">;
	/**
	 * SELECT columns AS aliases
	 */
	public select<const COLUMNS extends SelectColumnsRecord<TABLE, NAME>> (columns: COLUMNS): SelectFromTable<TABLE, NAME, COLUMNS>;
	/**
	 * SELECT columns
	 */
	public select<COLUMNS extends Schema.Column<TABLE>[]> (...columns: COLUMNS): SelectFromTable<TABLE, NAME, COLUMNS>;
	/**
	 * SELECT *
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromTable<TABLE, "*"> = SelectFromTable<TABLE, "*">> (column: "*", initialiser: Initialiser<SelectFromTable<TABLE, "*">, RETURN>): RETURN;
	/**
	 * SELECT 1
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<RETURN extends SelectFromTable<TABLE, NAME, 1> = SelectFromTable<TABLE, NAME, 1>> (initialiser: Initialiser<SelectFromTable<TABLE, NAME, 1>, RETURN>): RETURN;
	/**
	 * SELECT columns
	 * ...then provide an initialiser for tweaking the query
	 */
	public select<COLUMNS extends Schema.Column<TABLE>[], RETURN extends SelectFromTable<TABLE, NAME, COLUMNS>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
	public select (...params: (Partial<Record<string, Schema.Column<TABLE>>> | Schema.Column<TABLE> | "*" | Initialiser<SelectFromTable<TABLE, NAME>> | Initialiser<SelectFromTable<TABLE, "*">> | Initialiser<SelectFromTable<TABLE, NAME, 1>>)[]): SelectFromTable<TABLE, any> | SelectFromTable<TABLE, "*"> | SelectFromTable<TABLE, NAME, 1> {
		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<SelectFromTable<TABLE, NAME>> : undefined;

		const input =
			params.length === 0 ? 1
				: params.length === 1 && typeof params[0] === "object" ? params[0]
					: params as Schema.Column<TABLE>[];

		const query = new SelectFromTable(this.name, this.schema, input)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return initialiser?.(query as any) ?? query;
	}

	public insert<COLUMNS extends Schema.Column<TABLE>[]> (...columns: COLUMNS): InsertIntoTableFactory<TABLE, NAME, COLUMNS>;
	public insert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, NAME, COLUMNS> | InsertIntoTable<TABLE, NAME>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
	public insert (data: Partial<Schema.RowInput<TABLE>>): InsertIntoTable<TABLE, NAME>;
	public insert (data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<InsertIntoTable<TABLE, NAME>>): InsertIntoTable<TABLE, NAME>;
	public insert (...params: (boolean | Partial<Schema.RowInput<TABLE>> | Schema.Column<TABLE> | Initialiser<InsertIntoTableFactory<TABLE, NAME>> | Initialiser<InsertIntoTable<TABLE, NAME>>)[]): InsertIntoTableFactory<TABLE, NAME> | InsertIntoTable<TABLE, NAME> {
		const isUpsert = params[0] === true;
		if (typeof params[0] === "boolean")
			params.shift();

		const initialiser = typeof params[params.length - 1] === "function" ? params.pop() as Initialiser<InsertIntoTableFactory<TABLE, NAME> | InsertIntoTable<TABLE, NAME>> : undefined;

		if (typeof params[0] === "object") {
			const row = params[0] as Record<string, ValidType>
			const columns = Object.keys(row).filter(column => row[column] !== undefined);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			const query = ((this.insert as any)(isUpsert as any, ...columns as Schema.Column<TABLE>[]) as InsertIntoTableFactory<TABLE, NAME>)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
				.values(...columns.map(key => row[key] as any));

			return initialiser?.(query) as InsertIntoTable<TABLE, NAME> ?? query;
		}

		const query = InsertIntoTable.columns<TABLE, NAME>(this.name, this.schema, params as Schema.Column<TABLE>[], isUpsert);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return initialiser?.(query) ?? query;
	}

	public upsert (data: Schema.RowInput<TABLE>): InsertIntoTable<TABLE, NAME>;
	public upsert<RETURN extends InsertIntoTable<TABLE, any>> (data: Schema.RowInput<TABLE>, initialiser: Initialiser<InsertIntoTable<TABLE, NAME>, RETURN>): RETURN;
	public upsert<COLUMNS extends Schema.Column<TABLE>[]> (...columns: COLUMNS): InsertIntoTableFactory<TABLE, NAME, COLUMNS>;
	public upsert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, NAME, COLUMNS> | InsertIntoTable<TABLE, NAME>> (...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
	public upsert (...params: (Schema.RowInput<TABLE> | Schema.Column<TABLE> | Initialiser<InsertIntoTableFactory<TABLE, NAME>> | Initialiser<InsertIntoTable<TABLE, NAME>>)[]): InsertIntoTableFactory<TABLE, NAME> | InsertIntoTable<TABLE, NAME> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		return (this.insert as any)(true, ...params as Schema.Column<TABLE>[]);
	}

	public update (): UpdateTable<NAME, TABLE>;
	public update (data: Partial<Schema.RowInput<TABLE>>): UpdateTable<NAME, TABLE>;
	public update<RETURN extends UpdateTable<NAME, TABLE, any>> (data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<UpdateTable<NAME, TABLE>, RETURN>): RETURN;
	public update (data?: Partial<Schema.RowInput<TABLE>>, initialiser?: Initialiser<UpdateTable<NAME, TABLE>, UpdateTable<NAME, TABLE, any>>): UpdateTable<NAME, TABLE, any> {
		const query = new UpdateTable<NAME, TABLE, any>(this.name, this.schema);
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

	public recursive<COLUMNS extends Schema.Column<TABLE>[]> (columns: COLUMNS, initialiser: (query: Recursive<TABLE, Pick<TABLE, COLUMNS[number]>, NAME>) => any) {
		const recursive = new Recursive<TABLE, Pick<TABLE, COLUMNS[number]>, NAME>(this.name, columns)
		initialiser(recursive)
		return recursive
	}
}
