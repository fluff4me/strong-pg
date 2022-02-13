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
            let start = 0;
            if (lastMigration.rowCount)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                start = lastMigration.rows[0].id_end;
            const statements = this.migrations
                .slice(start)
                .flatMap(migration => migration.compile());
            if (!statements.length)
                return;
            for (const statement of statements) {
                console.log(statement);
                await client.query(statement);
            }
            await client.query("INSERT INTO migrations VALUES ($1, $2)", [start, this.migrations.length - 1]);
            await client.query("COMMIT");
        });
    }
}
exports.History = History;
