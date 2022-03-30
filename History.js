"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const Transaction_1 = __importDefault(require("./Transaction"));
class History {
    constructor() {
        this.migrations = [];
    }
    migration(migration) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.migrations.push(migration);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    async migrate(pool) {
        await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
				id_start SMALLINT DEFAULT 0,
				id_end SMALLINT,
				migration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)`);
        const lastMigration = await pool.query("SELECT id_end FROM migrations ORDER BY id_end DESC LIMIT 1");
        let start = -1;
        if (lastMigration.rowCount)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            start = lastMigration.rows[0].id_end;
        const version = this.migrations.length - 1;
        if (process.env.DEBUG_PG)
            console.log(`Migrating to v${version}`);
        let migrated = false;
        for (let i = start + 1; i < this.migrations.length; i++) {
            if (process.env.DEBUG_PG)
                console.log("Beginning migration", i);
            migrated = true;
            const migration = this.migrations[i];
            const transactions = migration.getTransactions();
            let first = true;
            for (const transaction of transactions) {
                if (!first && process.env.DEBUG_PG)
                    console.log("Committed");
                first = false;
                const statements = transaction.compile();
                if (!statements.length) {
                    if (process.env.DEBUG_PG)
                        console.log("Migration contains no statements");
                    continue;
                }
                await Transaction_1.default.execute(pool, async (client) => {
                    for (const statement of statements) {
                        if (process.env.DEBUG_PG)
                            console.log(statement);
                        await client.query(statement);
                    }
                });
            }
        }
        if (!migrated && process.env.DEBUG_PG) {
            console.log(`Already on v${version}, no migrations necessary`);
            return start;
        }
        await pool.query("INSERT INTO migrations VALUES ($1, $2)", [start, version]);
        if (process.env.DEBUG_PG)
            console.log(`Migrated to v${version}`);
        return version;
    }
}
exports.History = History;
