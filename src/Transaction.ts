import { Pool, PoolClient } from "pg";
import Statement from "./statements/Statement";

type PoolClientWithThrowErrorFunction = PoolClient & { throwError: (err: Error) => any };

export default class Transaction {

	public static async execute<R> (pool: Pool | PoolClient, executor: (client: PoolClient) => Promise<R>, handleError?: (err: Error, client: PoolClient) => any) {
		if ((pool as PoolClient).release) {
			try {
				// already in a transaction
				return await executor(pool as PoolClient);
			} catch (err) {
				(pool as PoolClientWithThrowErrorFunction).throwError?.(err as Error);
				handleError?.(err as Error, pool as PoolClient);
				throw err;
			}
		}

		const client = await (pool as Pool).connect();
		await client.query("BEGIN");
		try {
			let error: Error | undefined;
			const errorPromise = new Promise<Error>(r => (client as PoolClientWithThrowErrorFunction).throwError = err => {
				error = err || new Error("Unknown transaction error");
				r(err);
			});

			const result = await Promise.race([errorPromise, executor(client)]);
			if (error) {
				handleError?.(error, client);
				throw error;
			}

			await client.query("COMMIT");
			return result as R;
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
