"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectFromVirtualTable = void 0;
const Schema_1 = __importDefault(require("../Schema"));
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
class SelectFromVirtualTable extends Statement_1.default {
    constructor(from, columns) {
        super();
        this.from = from;
        this.columns = columns;
        this.vars = (typeof from === "string" ? undefined : from?.["vars"]) ?? [];
    }
    where(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars);
        this.condition = `WHERE (${queryable.text})`;
        return this;
    }
    limit(count) {
        this._limit = count;
        return this;
    }
    orderBy(...args) {
        if (Array.isArray(args[0]))
            this._orderBy = args[0];
        else
            this._orderBy = [args];
        return this;
    }
    offset(amount) {
        if (typeof amount !== "number")
            throw new Error("Unsafe value for offset");
        this._offset = amount;
        return this;
    }
    compile() {
        const orderBy = this._orderBy?.length ? `ORDER BY ${this._orderBy
            .map(order => order[0] === null ? `${String(order[1])} IS NULL ${order[2]?.description ?? ""}` : `${String(order[0])} ${order[1]?.description ?? ""}`)
            .join(",")}` : "";
        const offset = this._offset ? `OFFSET ${this._offset}` : "";
        const limit = this._limit ? `LIMIT ${this._limit}` : "";
        const from = typeof this.from === "string" ? this.from : this.from.compileFrom?.() ?? this.from["name"];
        const columns = this.columns === "*" ? "*"
            : Array.isArray(this.columns) ? this.columns.join(",")
                : Object.entries(this.columns)
                    .map(([column, alias]) => column === alias ? column : `${column} ${alias}`)
                    .join(",");
        return this.queryable(`${this.compileWith()}SELECT ${columns} FROM ${from} ${this.condition ?? ""} ${orderBy} ${offset} ${limit}`, undefined, this.vars);
    }
    compileWith() {
        const withExpr = typeof this.from === "string" ? undefined : this.from.compileWith?.();
        return !withExpr ? "" : `WITH ${withExpr} `;
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
exports.SelectFromVirtualTable = SelectFromVirtualTable;
class SelectFromTable extends SelectFromVirtualTable {
    constructor(tableName, schema, columns) {
        super(tableName, columns);
        this.tableName = tableName;
        this.schema = schema;
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
}
exports.default = SelectFromTable;
