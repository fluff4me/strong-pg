import { Pool, PoolClient } from "pg";
import Statement from "./Statement";

export default class Transaction extends Statement {

	public static async execute (pool: Pool, executor: (client: PoolClient) => Promise<void>) {
		const client = await pool.connect();
		await client.query("BEGIN");
		try {
			await executor(client);
			await client.query("COMMIT");
		} catch (err) {
			await client.query("ROLLBACK");
			throw err;
		} finally {
			client.release();
		}
	}

	protected readonly statements: Statement[] = [];

	public add (statement: Statement) {
		this.statements.push(statement);
		return this;
	}

	public async execute (pool: Pool) {
		return Transaction.execute(pool, async client => {
			for (const statement of this.compile())
				await client.query(statement);
		});
	}

	public override compile () {
		return this.statements.flatMap(statement => statement.compile());
	}
}