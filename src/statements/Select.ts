import { QueryResult } from "pg";
import { MigrationTypeFromString, OutputTypeFromString } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Expression, { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";

type SingleStringUnion<T> = ((k: ((T extends any ? () => T : never) extends infer U ? ((U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never) extends () => (infer R) ? R : never : never)) => any) extends (k: T) => any ? T : never;

export default class SelectFromTable<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[] = Schema.Column<SCHEMA>[], RESULT = { [K in "*" extends COLUMNS[number] ? Schema.Column<SCHEMA> : COLUMNS[number]]: OutputTypeFromString<SCHEMA[K]> }[]> extends Statement<RESULT> {

	private vars?: any[];
	public constructor (public readonly tableName: string, public readonly schema: SCHEMA, public readonly columns: COLUMNS) {
		super();
	}

	private condition?: string;
	public where (initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>) {
		const queryable = Expression.compile(initialiser);
		this.vars = queryable.values;
		this.condition = `WHERE (${queryable.text})`;
		return this;
	}

	private isPrimaryKeyed?: true;
	public primaryKeyed (id: MigrationTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const primaryKey = this.schema["PRIMARY_KEY"][0];
		this.isPrimaryKeyed = true;
		this.where(expr => expr.var(primaryKey).equals(id as never));
		return this as SelectFromTable<SCHEMA, COLUMNS, { [K in "*" extends COLUMNS[number] ? Schema.Column<SCHEMA> : COLUMNS[number]]: OutputTypeFromString<SCHEMA[K]> } | undefined>;
	}

	public compile () {
		return this.queryable(`SELECT ${this.columns.join(",")} FROM ${this.tableName} ${this.condition ?? ""}`, undefined, this.vars);
	}

	protected override resolveQueryOutput (output: QueryResult<any>) {
		if (!this.isPrimaryKeyed)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return output.rows;

		if (output.rows.length > 1)
			throw new Error("More than one row returned for primary keyed query");

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return output.rows[0];
	}
}
