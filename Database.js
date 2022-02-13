import { History } from "./History";
export default class Database {
    constructor(schema, pool) {
        this.schema = schema;
        this.pool = pool;
    }
    async migrate() {
        await this.history?.migrate(this.pool);
    }
    setHistory(initialiser) {
        this.history = initialiser(new History());
        return this;
    }
}
