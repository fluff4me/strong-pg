import { Pool, PoolClient } from "pg";
import Statement from "./statements/Statement";
export default class Transaction {
    static execute<R>(pool: Pool | PoolClient, executor: (client: PoolClient) => Promise<R>): Promise<R>;
    protected readonly statements: (Statement | (() => Statement))[];
    add(statement: Statement | (() => Statement)): this;
    execute(pool: Pool): Promise<void>;
    compile(): Statement.Queryable[];
}
