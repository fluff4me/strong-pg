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
    static async execute(pool, executor, handleError) {
        if (pool.release) {
            try {
                // already in a transaction
                return await executor(pool);
            }
            catch (err) {
                pool.throwError?.(err);
                handleError?.(err, pool);
                throw err;
            }
        }
        const client = await pool.connect();
        await client.query("BEGIN");
        try {
            let error;
            const errorPromise = new Promise(r => client.throwError = err => {
                error = err || new Error("Unknown transaction error");
                r(err);
            });
            const result = await Promise.race([errorPromise, executor(client)]);
            if (error) {
                handleError?.(error, client);
                throw error;
            }
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
