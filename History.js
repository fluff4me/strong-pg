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
        this.migrations.push(migration);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    async migrate(pool) {
        return Transaction_1.default.execute(pool, async (client) => {
            // await pool.query("DROP TABLE IF EXISTS migrations;");
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
            const statements = this.migrations
                .slice(start + 1)
                .flatMap(migration => migration.compile());
            if (!statements.length) {
                if (process.env.DEBUG_PG)
                    console.log("No migrations necessary");
                return start;
            }
            for (const statement of statements) {
                if (process.env.DEBUG_PG)
                    console.log(statement);
                await client.query(statement);
            }
            const version = this.migrations.length - 1;
            await client.query("INSERT INTO migrations VALUES ($1, $2)", [start, version]);
            await client.query("COMMIT");
            if (process.env.DEBUG_PG)
                console.log(`Migrated to v${version}`);
            return version;
        });
    }
}
exports.History = History;
