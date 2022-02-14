import { Pool } from "pg";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";
import Transaction from "./Transaction";

export class History<SCHEMA extends DatabaseSchema | null = null> {

	private migrations: Migration<DatabaseSchema | null, DatabaseSchema>[] = [];

	public migration<SCHEMA_END extends DatabaseSchema> (migration: Migration<SCHEMA, SCHEMA_END>): History<SCHEMA_END> {
		this.migrations.push(migration);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public async migrate (pool: Pool) {
		return Transaction.execute(pool, async client => {
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
				start = lastMigration.rows[0].id_end as number;

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
				console.log(`Migrated to ${version}`)

			return version;
		});
	}
}
