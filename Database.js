"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const History_1 = require("./History");
const Table_1 = __importDefault(require("./Table"));
class Database {
    constructor(schema) {
        this.schema = schema;
    }
    async migrate(pool) {
        return this.history?.migrate(this, pool);
    }
    setHistory(initialiser) {
        this.history = initialiser(new History_1.History());
        return this;
    }
    /**
     * Drops the database if the environment variable `DEBUG_PG_ALLOW_DROP` is set
     */
    async dropIfShould(pool) {
        if (!process.env.DEBUG_PG_ALLOW_DROP)
            return;
        return pool.query("DROP OWNED BY CURRENT_USER CASCADE");
    }
    table(tableName) {
        return new Table_1.default(tableName, this.schema.tables[tableName]);
    }
}
exports.default = Database;
