"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const Transaction_1 = __importDefault(require("./Transaction"));
let ansicolor;
function color(color, text) {
    if (!ansicolor) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            ansicolor = require("ansicolor");
            // eslint-disable-next-line no-empty
        }
        catch { }
        if (!ansicolor)
            return text;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return ansicolor[color](text);
}
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
        this.log(color("lightYellow", `Found migrations up to v${targetVersion}`));
        let migratedVersion;
        let migratedCommitIndex;
        let rolledBack = false;
        for (let i = startCommitIndex + 1; i < commits.length; i++) {
            const commit = commits[i];
            this.log(`Beginning migration ${commit.version} ${commit.file ? color("lightBlue", commit.file) : ""}`);
            const statements = commit.compile();
            if (!statements.length) {
                this.log("Migration contains no statements");
                continue;
            }
            let stack;
            try {
                await Transaction_1.default.execute(pool, async (client) => {
                    for (const statement of statements) {
                        this.log("  >", color("darkGray", statement.text));
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
                this.log([
                    `${color("lightRed", `Encountered an error: ${err.message[0].toUpperCase()}${err.message.slice(1)}`)}`,
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
            this.log(color("lightGreen", `Already on v${version}, no migrations necessary`));
            return startCommitIndex;
        }
        if (migratedVersion !== undefined)
            await pool.query("INSERT INTO migrations VALUES ($1, $2)", [startCommitIndex, migratedCommitIndex]);
        this.log(color(rolledBack ? "lightYellow" : "lightGreen", `${rolledBack ? "Rolled back" : "Migrated"} to v${version}`));
        return commitIndex;
    }
    log(prefix, text) {
        if (!process.env.DEBUG_PG)
            return;
        if (text === undefined)
            text = prefix, prefix = "";
        prefix = prefix ? prefix.slice(0, 20).trimEnd() + " " : prefix; // cap prefix length at 20
        const maxLineLength = 150 - prefix.length;
        text = text.split("\n")
            .flatMap(line => {
            const lines = [];
            while (line.length > maxLineLength) {
                lines.push(line.slice(0, maxLineLength));
                line = line.slice(maxLineLength);
            }
            lines.push(line.trimEnd());
            return lines;
        })
            .filter(line => line)
            .map((line, i) => i ? line.padStart(line.length + prefix.length, " ") : `${prefix}${line}`)
            .join("\n");
        console.log(text);
    }
}
exports.History = History;
