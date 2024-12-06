"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const Log_1 = __importStar(require("./Log"));
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
    async migrate(db, pool) {
        for (const migration of this.migrations)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            migration["db"] = db;
        await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
				migration_index_start SMALLINT DEFAULT 0,
				migration_index_end SMALLINT,
				migration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)`);
        const lastMigration = await pool.query("SELECT migration_index_end FROM migrations ORDER BY migration_index_end DESC LIMIT 1");
        let startCommitIndex = -1;
        if (lastMigration.rowCount)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            startCommitIndex = lastMigration.rows[0].migration_index_end;
        const commits = this.migrations.flatMap((migration, major) => migration.getCommits()
            .map((commit, minor) => { commit.version = minor ? `${major + 1}.${minor}` : `${major + 1}`; return commit; }));
        if (!commits.length)
            return -1;
        const targetVersion = commits[commits.length - 1].version;
        (0, Log_1.default)((0, Log_1.color)("lightYellow", `Found migrations up to v${targetVersion}`));
        let migratedVersion;
        let migratedCommitIndex;
        let rolledBack = false;
        for (let i = startCommitIndex + 1; i < commits.length; i++) {
            const commit = commits[i];
            (0, Log_1.default)(`Beginning migration ${commit.version} ${commit.file ? (0, Log_1.color)("lightBlue", commit.file) : ""}`);
            const statements = commit.compile();
            if (!statements.length) {
                (0, Log_1.default)("Migration contains no statements");
                continue;
            }
            let stack;
            try {
                await Transaction_1.default.execute(pool, async (client) => {
                    for (const statement of statements) {
                        (0, Log_1.default)("  > ", (0, Log_1.color)("darkGray", statement.text));
                        stack = statement.stack;
                        await client.query(statement);
                    }
                });
                migratedVersion = commit.version;
                migratedCommitIndex = i;
            }
            catch (e) {
                const err = e;
                const formattedStack = stack?.format();
                (0, Log_1.default)([
                    `${(0, Log_1.color)("lightRed", `Encountered an error: ${err.message[0].toUpperCase()}${err.message.slice(1)}`)}`,
                    err.hint ? `\n  ${err.hint}` : "",
                    formattedStack ? `\n${formattedStack}` : "",
                ].join(""));
                rolledBack = true;
                break;
            }
        }
        const commitIndex = migratedCommitIndex ?? startCommitIndex;
        const version = commits[commitIndex].version;
        if (migratedVersion === undefined && !rolledBack) {
            (0, Log_1.default)((0, Log_1.color)("lightGreen", `Already on v${version}, no migrations necessary`));
            return startCommitIndex;
        }
        if (migratedVersion !== undefined)
            await pool.query("INSERT INTO migrations VALUES ($1, $2)", [startCommitIndex, migratedCommitIndex]);
        (0, Log_1.default)((0, Log_1.color)(rolledBack ? "lightYellow" : "lightGreen", `${rolledBack ? "Rolled back" : "Migrated"} to v${version}`));
        return commitIndex;
    }
}
exports.History = History;
