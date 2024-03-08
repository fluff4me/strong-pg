import { QueryResult } from "pg";
import { Initialiser, InputTypeFromString, ValidType, Value } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression from "../expressions/Expression";
import Statement from "./Statement";
import UpdateTable from "./Update";

export interface InsertIntoTableFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> {
	values (...values: { [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]> }): InsertIntoTable<SCHEMA, COLUMNS>;
}

export interface InsertIntoTableConflictActionFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> {
	doNothing (): InsertIntoTable<SCHEMA, COLUMNS, RESULT>;
	doUpdate (initialiser: Initialiser<UpdateTable<SCHEMA, any, { [KEY in COLUMNS[number]as `EXCLUDED.${KEY & string}`]: SCHEMA[KEY] }>>): InsertIntoTable<SCHEMA, COLUMNS, RESULT>;
}

export default class InsertIntoTable<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> extends Statement<RESULT> {

	public static columns<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> (tableName: string, schema: SCHEMA, columns: COLUMNS, isUpsert = false): InsertIntoTableFactory<SCHEMA, COLUMNS> {
		const primaryKey = !isUpsert ? undefined : Schema.getSingleColumnPrimaryKey(schema);

		return {
			values: (...values: any[]) => {
				const query = new InsertIntoTable<SCHEMA, COLUMNS>(tableName, schema, columns, values as never);
				if (isUpsert) {
					query.onConflict(primaryKey!).doUpdate(update => {
						for (let i = 0; i < columns.length; i++) {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
							update.set(columns[i], ((expr: any) => expr.var(`EXCLUDED.${String(columns[i])}`)) as never);
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

	private conflictTarget?: Schema.Column<SCHEMA>[];
	private conflictAction?: null | UpdateTable<SCHEMA, any>;
	public onConflict (...columns: Schema.Column<SCHEMA>[]): InsertIntoTableConflictActionFactory<SCHEMA, COLUMNS, RESULT> {
		this.conflictTarget = columns;
		return {
			doNothing: () => {
				this.conflictAction = null;
				return this;
			},
			doUpdate: initialiser => {
				this.conflictAction = new UpdateTable(undefined, this.schema, this.vars);
				initialiser(this.conflictAction);
				return this;
			},
		}
	}

	public compile () {
		const values = this.values.map((value: ValidType, i) => {
			const column = this.columns[i];
			if (Schema.isColumn(this.schema, column, "TIMESTAMP") && typeof value === "number")
				value = new Date(value);
			return Expression.stringifyValue(value, this.vars);
		}).join(",");

		const conflictTarget = this.conflictTarget?.length ? `(${this.conflictTarget.join(",")})` : "";
		let conflictAction = this.conflictAction === undefined ? " "
			: this.conflictAction === null ? `ON CONFLICT ${conflictTarget} DO NOTHING`
				: undefined;

		if (this.conflictAction) {
			const compiled = this.conflictAction.compile()[0];
			conflictAction = `ON CONFLICT ${conflictTarget} DO ${compiled.text}`;
		}

		return this.queryable(`INSERT INTO ${this.tableName} (${this.columns.join(",")}) VALUES (${values}) ${conflictAction!}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}