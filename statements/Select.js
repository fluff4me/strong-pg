"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
class SelectFromTable extends Statement_1.default {
    constructor(tableName, schema, columns) {
        super();
        this.tableName = tableName;
        this.schema = schema;
        this.columns = columns;
    }
    where(initialiser) {
        const queryable = Expression_1.default.compile(initialiser);
        this.vars = queryable.values;
        this.condition = `WHERE (${queryable.text})`;
        return this;
    }
    primaryKeyed(id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const primaryKey = this.schema["PRIMARY_KEY"][0];
        this.isPrimaryKeyed = true;
        this.where(expr => expr.var(primaryKey).equals(id));
        return this;
    }
    compile() {
        return this.queryable(`SELECT ${this.columns.join(",")} FROM ${this.tableName} ${this.condition ?? ""}`, undefined, this.vars);
    }
    resolveQueryOutput(output) {
        if (!this.isPrimaryKeyed)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return output.rows;
        if (output.rows.length > 1)
            throw new Error("More than one row returned for primary keyed query");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return output.rows[0];
    }
}
exports.default = SelectFromTable;
