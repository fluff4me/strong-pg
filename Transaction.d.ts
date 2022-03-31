import { Pool, PoolClient } from "pg";
import Statement from "./statements/Statement";
export default class Transaction extends Statement {
    static execute<R>(pool: Pool, executor: (client: PoolClient) => Promise<R>): Promise<R>;
    protected readonly statements: Statement[];
    add(statement: Statement): this;
    execute(pool: Pool): Promise<void>;
    compile(): Statement.Queryable[];
}
