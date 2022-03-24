import { Pool } from "pg";
import { History } from "./History";
import { DatabaseSchema } from "./Schema";

export default class Database<SCHEMA extends DatabaseSchema> {

	protected history?: History<SCHEMA>;

	public constructor (protected readonly schema: SCHEMA, protected readonly pool: Pool) {

	}

	public async migrate () {
		return this.history?.migrate(this.pool);
	}

	public setHistory (initialiser: (history: History) => History<SCHEMA>) {
		this.history = initialiser(new History());
		return this;
	}

	/**
	 * @deprecated WARNING: This drops and recreates your database!
	 */
	public async drop () {
		return this.pool.query("DROP OWNED BY CURRENT_USER CASCADE");
	}
}
