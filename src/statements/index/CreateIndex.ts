import Expression, { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";

export type CreateIndexInitialiser<SCHEMA extends Record<string, any>> =
	Initialiser<CreateIndex<SCHEMA>, CreateIndex<SCHEMA, true>>;

export const NULLS_DISTINCT = Symbol("NULLS DISTINCT");
export const NULLS_NOT_DISTINCT = Symbol("NULLS NOT DISTINCT");

export default class CreateIndex<SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {

	private isUnique: typeof NULLS_DISTINCT | typeof NULLS_NOT_DISTINCT | undefined;
	private readonly columns: string[] = [];
	protected readonly valid!: COLUMNS;

	public constructor (public readonly name: string, public readonly on: string) {
		super();
	}

	public unique (option: typeof NULLS_DISTINCT | typeof NULLS_NOT_DISTINCT) {
		this.isUnique = option;
		return this;
	}

	public column<COLUMN extends keyof SCHEMA & string> (column: COLUMN): CreateIndex<SCHEMA, true> {
		this.columns.push(column);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public expression (initialiser: ExpressionInitialiser<SCHEMA, any>): CreateIndex<SCHEMA, true> {
		this.columns.push(Expression.compile(initialiser).text);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		return this.queryable(`CREATE${this.isUnique ? " UNIQUE" : ""} INDEX ${this.name} ON ${this.on} (${this.columns.join(", ")}) ${this.isUnique?.description ?? ""}`);
	}
}
