import Expression, { ExpressionInitialiser } from "../../expressions/Expression";
import Statement from "../Statement";

export default class CreateIndex<NAME extends string, SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {

	private isUnique = false;
	private readonly columns: string[] = [];
	private readonly valid!: COLUMNS;

	public constructor (public readonly name: NAME, public readonly on: string) {
		super();
	}

	public unique () {
		this.isUnique = true;
		return this;
	}

	public column<COLUMN extends keyof SCHEMA & string> (column: COLUMN): CreateIndex<NAME, SCHEMA, true> {
		this.columns.push(column);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public expression (initialiser: ExpressionInitialiser<SCHEMA, any>): CreateIndex<NAME, SCHEMA, true> {
		this.columns.push(Expression.stringify(initialiser));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		return `CREATE${this.isUnique ? " UNIQUE" : ""} INDEX ${this.name} ON ${this.on} (${this.columns.join(", ")})`;
	}
}
