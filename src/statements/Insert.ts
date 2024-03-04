import { QueryResult } from "pg";
import { Initialiser, InputTypeFromString, Value } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression from "../expressions/Expression";
import Statement from "./Statement";
import UpdateTable from "./Update";

export interface InsertIntoTableFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> {
	values (...values: { [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]> }): InsertIntoTable<SCHEMA, COLUMNS>;
}

export default class InsertIntoTable<SCHEMA extends TableSchema, RESULT = []> extends Statement<RESULT> {

	public static columns<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> (tableName: string, schema: SCHEMA, columns: COLUMNS, isUpsert = false): InsertIntoTableFactory<SCHEMA, COLUMNS> {
		return {
			values: (...values: any[]) => {
				const query = new InsertIntoTable<SCHEMA, COLUMNS>(tableName, schema, columns, values as never);
				if (isUpsert) {
					query.onConflictDoUpdate(update => {
						for (let i = 0; i < columns.length; i++) {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							update.set(columns[i], values[i]);
						}
					});
				}

				return query;
			},
		};
	}

	private vars: any[] = [];
	public constructor (public readonly tableName: string, public readonly schema: SCHEMA, public readonly columns: Schema.Column<SCHEMA>[], public readonly values: Value<Schema.RowInput<SCHEMA>>[]) {
		super();
	}

	private onConflict?: null | UpdateTable<SCHEMA, any>;
	public onConflictDoNothing () {
		this.onConflict = null;
		return this;
	}

	public onConflictDoUpdate (initialiser: Initialiser<UpdateTable<SCHEMA, any>>) {
		this.onConflict = new UpdateTable(undefined, this.schema, this.vars);
		initialiser(this.onConflict);
		return this;
	}

	public compile () {
		const values = this.values.map(value => Expression.stringifyValue(value, this.vars)).join(",");
		let onConflict = this.onConflict === undefined ? " "
			: this.onConflict === null ? "ON CONFLICT DO NOTHING"
				: undefined;

		if (this.onConflict) {
			const compiled = this.onConflict.compile()[0];
			onConflict = `ON CONFLICT DO ${compiled.text}`;
		}

		return this.queryable(`INSERT INTO ${this.tableName} (${this.columns.join(",")}) VALUES (${values}) ${onConflict!}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}