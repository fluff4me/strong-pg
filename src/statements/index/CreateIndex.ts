import Expression from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";

export default class CreateIndex<NAME extends string, SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {

	private isUnique = false;
	private readonly columns: (string | CreateIndexColumnExpression<SCHEMA>)[] = [];

	public constructor (public readonly name: NAME, public readonly on: string) {
		super();
	}

	public unique () {
		this.isUnique = true;
		return this;
	}

	public column<COLUMN extends keyof SCHEMA & string> (column: COLUMN): CreateIndex<NAME, SCHEMA, true> {
		this.columns.push(column);
		return this;
	}

	public expression (initialiser: Initialiser<CreateIndexColumnExpression<SCHEMA>>): CreateIndex<NAME, SCHEMA, true> {
		const expression = new CreateIndexColumnExpression<SCHEMA>();
		initialiser(expression);
		this.columns.push(expression);
		return this;
	}

	public compile () {
		const columns = this.columns.map(column => typeof column === "string" ? column : `(${column.compile()})`);
		return `CREATE${this.isUnique ? " UNIQUE" : ""} INDEX ${this.name} ON ${this.on} (${columns.join(", ")})`;
	}
}

export class CreateIndexColumnExpression<SCHEMA extends Record<string, any>> extends Expression {

}
