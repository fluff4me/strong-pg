"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("./statements/Statement"));
class Transaction {
    constructor() {
        this.statements = [];
    }
    static async execute(pool, executor) {
        if (pool.release)
            // already in a transaction
            return await executor(pool);
        const client = await pool.connect();
        await client.query("BEGIN");
        try {
            const result = await executor(client);
            await client.query("COMMIT");
            return result;
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    add(statement) {
        this.statements.push(statement);
        return this;
    }
    async execute(pool) {
        return Transaction.execute(pool, async (client) => {
            for (const statement of this.compile())
                await client.query(statement);
        });
    }
    compile() {
        return this.statements.flatMap(statement => (typeof statement === "function" ? statement() : statement).compile());
    }
}
exports.default = Transaction;
Statement_1.default["Transaction"] = Transaction;
