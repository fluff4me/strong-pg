"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(require("../Schema"));
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
class SelectFromTable extends Statement_1.default {
    constructor(tableName, schema, columns) {
        super();
        this.tableName = tableName;
        this.schema = schema;
        this.columns = columns;
        this.vars = [];
    }
    where(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars);
        this.condition = `WHERE (${queryable.text})`;
        return this;
    }
    primaryKeyed(id, initialiser) {
        const primaryKey = Schema_1.default.getSingleColumnPrimaryKey(this.schema);
        this.where(expr => {
            const e2 = expr.var(primaryKey).equals(id);
            if (initialiser)
                e2.and(initialiser);
            return e2;
        });
        return this.limit(1);
    }
    limit(count) {
        this._limit = count;
        return this;
    }
    compile() {
        return this.queryable(`SELECT ${this.columns.join(",")} FROM ${this.tableName} ${this.condition ?? ""} ${this._limit ? `LIMIT ${this._limit}` : ""}`, undefined, this.vars);
    }
    async queryOne(pool) {
        return this.limit(1).query(pool);
    }
    resolveQueryOutput(output) {
        if (this._limit !== 1)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return output.rows;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return output.rows[0];
    }
}
exports.default = SelectFromTable;
