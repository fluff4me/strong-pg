import { ClientOrPool } from "./IStrongPG";
import Statement from "./Statement";

export default class Transaction extends Statement {

	protected readonly statements: Statement[] = [];

	public add (statement: Statement) {
		this.statements.push(statement);
		return this;
	}

	public async execute (pool: ClientOrPool) {
		return pool.query(`BEGIN;${this.compile()}COMMIT;`);
	}

	public override compile () {
		return this.statements.join(";");
	}
}