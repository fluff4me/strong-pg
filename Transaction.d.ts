import { Pool, PoolClient } from "pg";
import Statement from "./Statement";
export default class Transaction extends Statement {
    static execute(pool: Pool, executor: (client: PoolClient) => Promise<void>): Promise<void>;
    protected readonly statements: Statement[];
    add(statement: Statement): this;
    execute(pool: Pool): Promise<void>;
    compile(): string[];
}
