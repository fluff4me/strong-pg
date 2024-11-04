import { QueryResult } from "pg";
import { Initialiser, InputTypeFromString, OutputTypeFromString, ValidType, Value } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression from "../expressions/Expression";
import Statement from "./Statement";
import UpdateTable from "./Update";

export interface InsertIntoTableFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> {
	prepare (): InsertIntoTable<SCHEMA, COLUMNS>;
	values (...values: { [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]> }): InsertIntoTable<SCHEMA, COLUMNS>;
}

export interface InsertIntoTableConflictActionFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> {
	doNothing (): InsertIntoTable<SCHEMA, COLUMNS, RESULT>;
	doUpdate (initialiser: Initialiser<UpdateTable<SCHEMA, any, { [KEY in COLUMNS[number]as `EXCLUDED.${KEY & string}`]: SCHEMA[KEY] }>>): InsertIntoTable<SCHEMA, COLUMNS, RESULT>;
}

export default class InsertIntoTable<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> extends Statement<RESULT> {

	public static columns<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> (tableName: string, schema: SCHEMA, columns: COLUMNS, isUpsert = false): InsertIntoTableFactory<SCHEMA, COLUMNS> {
		const primaryKey = !isUpsert ? undefined : Schema.getPrimaryKey(schema);

		return {
			prepare: () => {
				const query = new InsertIntoTable<SCHEMA, COLUMNS>(tableName, schema, columns, [])
				if (isUpsert) registerUpsert(query);
				return query;
			},
			values: (...values: any[]) => {
				const query = new InsertIntoTable<SCHEMA, COLUMNS>(tableName, schema, columns, columns.length && !values.length ? [] : [values] as never);
				if (isUpsert) registerUpsert(query);
				return query;
			},
		};

		function registerUpsert<T extends InsertIntoTable<any, any>> (query: T): T {
			query.onConflict(...primaryKey!).doUpdate(update => {
				for (let i = 0; i < columns.length; i++) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
					update.set(columns[i], ((expr: any) => expr.var(`EXCLUDED.${String(columns[i])}`)) as never);
				}
			});

			return query
		}
	}

	private vars: any[] = [];
	public constructor (public readonly tableName: string, public readonly schema: SCHEMA, public readonly columns: Schema.Column<SCHEMA>[], public readonly rows: Value<Schema.RowInput<SCHEMA>>[][]) {
		super();
	}

	public values (...values: { [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]> }): this {
		this.rows.push(values);
		return this;
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

	private returningColumns?: (Schema.Column<SCHEMA> | "*")[];
	public returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]> (...columns: RETURNING_COLUMNS): InsertIntoTable<SCHEMA, COLUMNS, { [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]> }[]>;
	public returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | "*"> (columns: RETURNING_COLUMN): InsertIntoTable<SCHEMA, COLUMNS, { [KEY in RETURNING_COLUMN extends "*" ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]> }[]>;
	public returning (...columns: (Schema.Column<SCHEMA> | "*")[]) {
		this.returningColumns = columns;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as InsertIntoTable<SCHEMA, COLUMNS, any>;
	}

	public compile () {
		const rows = this.rows
			.map(row => row
				.map((v, i) => {
					let value = v as ValidType;
					const column = this.columns[i];
					if (Schema.isColumn(this.schema, column, "TIMESTAMP") && typeof value === "number")
						value = new Date(value);
					return Expression.stringifyValue(value, this.vars);
				})
				.join(","))
			.map(columnValues => `(${columnValues})`)
			.join(",");

		const conflictTarget = this.conflictTarget?.length ? `(${this.conflictTarget.join(",")})` : "";
		let conflictAction = this.conflictAction === undefined ? " "
			: this.conflictAction === null ? `ON CONFLICT ${conflictTarget} DO NOTHING`
				: undefined;

		if (this.conflictAction) {
			const compiled = this.conflictAction.compile()[0];
			conflictAction = `ON CONFLICT ${conflictTarget} DO ${compiled.text}`;
		}

		const returning = !this.returningColumns ? ""
			: `RETURNING ${this.returningColumns.join(",")}`;

		return this.queryable(`INSERT INTO ${this.tableName} (${this.columns.join(",")}) VALUES ${rows} ${conflictAction!} ${returning}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		return output.rows as RESULT;
	}
}