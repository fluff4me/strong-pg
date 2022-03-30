import { Pool } from "pg";
import Migration from "./Migration";
import { DatabaseSchema } from "./Schema";
import Transaction from "./Transaction";

let ansicolor: typeof import("ansicolor") | undefined;
function color (color: keyof typeof import("ansicolor"), text: string) {
	if (!ansicolor) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			ansicolor = require("ansicolor");
			// eslint-disable-next-line no-empty
		} catch { }

		if (!ansicolor)
			return text;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	return (ansicolor as any)[color](text) as string;
}

export class History<SCHEMA extends DatabaseSchema | null = null> {

	private migrations: Migration<DatabaseSchema | null, DatabaseSchema>[] = [];

	public migration<SCHEMA_END extends DatabaseSchema> (migration: Migration<SCHEMA, SCHEMA_END>): History<SCHEMA_END> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.migrations.push(migration as any);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public async migrate (pool: Pool) {

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

		const version = this.migrations.length - 1;
		this.log(color("lightYellow", `Found migrations up to v${version + 1}`));

		let migrated = false;
		for (let i = start + 1; i < this.migrations.length; i++) {
			const migration = this.migrations[i];
			this.log(`Beginning migration ${i + 1} ${migration.file ? color("lightBlue", migration.file) : ""}`);

			migrated = true;

			const transactions = migration.getTransactions();
			let first = true;
			for (const transaction of transactions) {
				if (!first)
					this.log(color("lightBlue", "Committed"));

				first = false;

				const statements = transaction.compile();

				if (!statements.length) {
					this.log("Migration contains no statements");
					continue;
				}

				await Transaction.execute(pool, async client => {
					for (const statement of statements) {
						this.log("  >", color("darkGray", statement));
						await client.query(statement);
					}
				});
			}
		}

		if (!migrated) {
			this.log(color("lightGreen", `Already on v${version + 1}, no migrations necessary`));
			return start;
		}

		await pool.query("INSERT INTO migrations VALUES ($1, $2)", [start, version]);

		this.log(color("lightGreen", `Migrated to v${version + 1}`));

		return version;
	}

	private log (text: string): void;
	private log (prefix: string, text: string): void;
	private log (prefix: string, text?: string) {
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
