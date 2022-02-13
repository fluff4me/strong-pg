export class History {
    constructor() {
        this.migrations = [];
    }
    migration(migration) {
        this.migrations.push(migration);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    async migrate(pool) {
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
