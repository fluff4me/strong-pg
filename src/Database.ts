import { History } from "./History";
import { ClientOrPool } from "./IStrongPG";
import { DatabaseSchema } from "./Schema";

export default class Database<SCHEMA extends DatabaseSchema> {

	protected history?: History<SCHEMA>;

	public constructor (protected readonly schema: SCHEMA, protected readonly pool: ClientOrPool) {

	}

	public async migrate () {
		await this.history?.migrate(this.pool);
	}

	public setHistory (initialiser: (history: History) => History<SCHEMA>) {
		this.history = initialiser(new History());
		return this;
	}
}
