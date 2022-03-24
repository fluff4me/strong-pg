import Expression, { ExpressionOperations, ExpressionValues } from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";

export default class CreateIndex<NAME extends string, SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {

	private isUnique = false;
	private readonly columns: (string | ExpressionOperations<keyof SCHEMA & string>)[] = [];
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

	public expression (initialiser: Initialiser<ExpressionValues<keyof SCHEMA & string>, ExpressionOperations<keyof SCHEMA & string>>): CreateIndex<NAME, SCHEMA, true> {
		const expression = new Expression<keyof SCHEMA & string>();
		initialiser(expression);
		this.columns.push(expression);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		const columns = this.columns.map(column => typeof column === "string" ? column : `(${(column as Expression).compile()})`);
		return `CREATE${this.isUnique ? " UNIQUE" : ""} INDEX ${this.name} ON ${this.on} (${columns.join(", ")})`;
	}
}
