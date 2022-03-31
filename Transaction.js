"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("./statements/Statement"));
class Transaction extends Statement_1.default {
    constructor() {
        super(...arguments);
        this.statements = [];
    }
    static async execute(pool, executor) {
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
        return this.queryable(this.statements.flatMap(statement => statement.compile()));
    }
}
exports.default = Transaction;
