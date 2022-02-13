import { History } from "./History";
import { ClientOrPool } from "./IStrongPG";
import { DatabaseSchema } from "./Schema";
export default class Database<SCHEMA extends DatabaseSchema> {
    protected readonly schema: SCHEMA;
    protected readonly pool: ClientOrPool;
    protected history?: History<SCHEMA>;
    constructor(schema: SCHEMA, pool: ClientOrPool);
    migrate(): Promise<void>;
    setHistory(initialiser: (history: History) => History<SCHEMA>): this;
}
