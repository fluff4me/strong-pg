import { Pool, PoolClient } from "pg";
import Statement from "./statements/Statement";

export default class Transaction {

	public static async execute<R> (pool: Pool | PoolClient, executor: (client: PoolClient) => Promise<R>) {
		if ((pool as PoolClient).release)
			// already in a transaction
			return await executor(pool as PoolClient);

		const client = await (pool as Pool).connect();
		await client.query("BEGIN");
		try {
			const result = await executor(client);
			await client.query("COMMIT");
			return result;
		} catch (err) {
			await client.query("ROLLBACK");
			throw err;
		} finally {
			client.release();
		}
	}

	protected readonly statements: (Statement | (() => Statement))[] = [];

	public add (statement: Statement | (() => Statement)) {
		this.statements.push(statement);
		return this;
	}

	public async execute (pool: Pool) {
		return Transaction.execute(pool, async client => {
			for (const statement of this.compile())
				await client.query(statement);
		});
	}

	public compile () {
		return this.statements.flatMap(statement => (typeof statement === "function" ? statement() : statement).compile());
	}
}

Statement["Transaction"] = Transaction;
