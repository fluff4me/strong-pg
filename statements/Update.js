"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(require("../Schema"));
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
const Values_1 = __importDefault(require("./Values"));
class UpdateTable extends Statement_1.default {
    constructor(tableName, schema, vars) {
        super();
        this.tableName = tableName;
        this.schema = schema;
        this.assignments = [];
        this.vars = vars ?? [];
    }
    from(name, columns, initialiser) {
        const values = new Values_1.default(name, columns);
        initialiser(values);
        this.fromExpr = values.compile();
        return this;
    }
    set(input, value) {
        if (typeof input === 'object') {
            for (const column of Object.keys(input))
                this.set(column, input[column]);
        }
        else {
            if (Schema_1.default.isColumn(this.schema, input, 'TIMESTAMP') && typeof value === 'number')
                value = new Date(value);
            this.assignments.push(`${String(input)}=${Expression_1.default.stringifyValue(value, this.vars)}`);
        }
        return this;
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
        const returning = !this.returningColumns?.length ? ''
            : `RETURNING ${this.returningColumns.join(',')}`;
        const fromString = this.fromExpr ? `FROM ${this.fromExpr.compile(this.vars)}` : '';
        return this.queryable(`UPDATE ${this.tableName ?? ''} SET ${this.assignments.join(',')} ${fromString} ${this.condition ?? ''} ${returning}`, undefined, this.vars);
    }
    resolveQueryOutput(output) {
        return (!this.returningColumns?.length ? output.rowCount : output.rows);
    }
}
exports.default = UpdateTable;
