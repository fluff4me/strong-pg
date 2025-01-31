"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(require("../Schema"));
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
class DeleteFromTable extends Statement_1.default {
    constructor(tableName, schema) {
        super();
        this.tableName = tableName;
        this.schema = schema;
        this.vars = [];
    }
    where(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars);
        this.condition = `WHERE (${queryable.text})`;
        return this;
    }
    primaryKeyed(id) {
        const primaryKey = Schema_1.default.getSingleColumnPrimaryKey(this.schema);
        this.where(expr => expr.var(primaryKey).equals(id));
        return this;
    }
    returning(...columns) {
        this.returningColumns = columns;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        const returning = !this.returningColumns?.length ? ""
            : `RETURNING ${this.returningColumns.join(",")}`;
        return this.queryable(`DELETE FROM ${this.tableName ?? ""} ${this.condition ?? ""} ${returning}`, undefined, this.vars);
    }
    resolveQueryOutput(output) {
        return output.rows;
    }
}
exports.default = DeleteFromTable;
