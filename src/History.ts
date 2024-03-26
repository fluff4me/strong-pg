import { DatabaseError, Pool, PoolClient } from "pg";
import Database from "./Database";
import { StackUtil } from "./IStrongPG";
import log, { color } from "./Log";
import Migration, { MigrationVersion } from "./Migration";
import { DatabaseSchema } from "./Schema";
import Transaction from "./Transaction";

export class History<SCHEMA extends DatabaseSchema | null = null> {

	private migrations: Migration<DatabaseSchema | null, DatabaseSchema>[] = [];
	protected readonly schema!: SCHEMA;

	public migration<MIGRATION extends Migration<any, any>> (migration: MIGRATION):
		MIGRATION extends Migration<infer SCHEMA_START, infer SCHEMA_END> ?
		SCHEMA_START extends SCHEMA ? SCHEMA extends SCHEMA_START ?
		History<SCHEMA_END>
		: null : null
		: null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.migrations.push(migration as any);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public async migrate (db: Database<SCHEMA & DatabaseSchema>, pool: Pool | PoolClient) {

		for (const migration of this.migrations)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			migration["db"] = db as Database<any>;

		await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
				migration_index_start SMALLINT DEFAULT 0,
				migration_index_end SMALLINT,
				migration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)`);

		const lastMigration = await pool.query("SELECT migration_index_end FROM migrations ORDER BY migration_index_end DESC LIMIT 1");

		let startCommitIndex = -1;
		if (lastMigration.rowCount)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			startCommitIndex = lastMigration.rows[0].migration_index_end as number;

		const commits = this.migrations.flatMap((migration, major) => migration.getCommits()
			.map((commit, minor) => { commit.version = minor ? `${major + 1}.${minor}` : `${major + 1}`; return commit; }));

		if (!commits.length)
			return -1;

		const targetVersion = commits[commits.length - 1].version!;
		log(color("lightYellow", `Found migrations up to v${targetVersion}`));

		let migratedVersion: MigrationVersion | undefined;
		let migratedCommitIndex: number | undefined;
		let rolledBack = false;
		for (let i = startCommitIndex + 1; i < commits.length; i++) {
			const commit = commits[i];
			log(`Beginning migration ${commit.version!} ${commit.file ? color("lightBlue", commit.file) : ""}`);

			const statements = commit.compile();
			if (!statements.length) {
				log("Migration contains no statements");
				continue;
			}

			let stack: StackUtil.Stack | undefined;
			try {
				await Transaction.execute(pool, async client => {
					for (const statement of statements) {
						log("  > ", color("darkGray", statement.text));
						stack = statement.stack;
						await client.query(statement);
					}
				});
				migratedVersion = commit.version;
				migratedCommitIndex = i;

			} catch (e) {
				const err = e as DatabaseError;
				const formattedStack = stack?.format();
				log([
					`${color("lightRed", `Encountered an error: ${err.message[0].toUpperCase()}${err.message.slice(1)}`)}`,
					err.hint ? `\n  ${err.hint}` : "",
					formattedStack ? `\n${formattedStack}` : "",
				].join(""));
				rolledBack = true;
				break;
			}
		}

		const commitIndex = migratedCommitIndex ?? startCommitIndex;
		const version = commits[commitIndex].version!;

		if (migratedVersion === undefined && !rolledBack) {
			log(color("lightGreen", `Already on v${version}, no migrations necessary`));
			return startCommitIndex;
		}

		if (migratedVersion !== undefined)
			await pool.query("INSERT INTO migrations VALUES ($1, $2)", [startCommitIndex, migratedCommitIndex]);

		log(color(rolledBack ? "lightYellow" : "lightGreen", `${rolledBack ? "Rolled back" : "Migrated"} to v${version}`));

		return commitIndex;
	}
}
