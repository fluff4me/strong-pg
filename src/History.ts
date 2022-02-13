import { ClientOrPool } from "./IStrongPG";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";

export class History<SCHEMA extends DatabaseSchema | null = null> {

	private migrations: Migration<DatabaseSchema | null, DatabaseSchema>[] = [];

	public migration<SCHEMA_END extends DatabaseSchema> (migration: Migration<SCHEMA, SCHEMA_END>): History<SCHEMA_END> {
		this.migrations.push(migration);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public async migrate (pool: ClientOrPool) {
		let result = await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
			id SMALLINT,
			migration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`);

		console.log(result);

		result = await pool.query("SELECT id FROM migrations ORDER BY id DESC LIMIT 1");

		console.log(result);

		// const migrations = this.migrations.map(migration => migration.compile())
		// 	.join(";");

		// return pool.query(`BEGIN;${migrations}COMMIT;`);
	}
}
