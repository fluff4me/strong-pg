"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectFromJoin = void 0;
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
var JoinType;
(function (JoinType) {
    JoinType[JoinType["Inner"] = 0] = "Inner";
    JoinType[JoinType["Left Outer"] = 1] = "Left Outer";
    JoinType[JoinType["Full Outer"] = 2] = "Full Outer";
    JoinType[JoinType["Right Outer"] = 3] = "Right Outer";
})(JoinType || (JoinType = {}));
class Join extends Statement_1.default {
    constructor(type, table1, table2, alias1, alias2, vars = []) {
        super();
        this.type = type;
        this.table1 = table1;
        this.table2 = table2;
        this.alias1 = alias1;
        this.alias2 = alias2;
        this.vars = vars;
    }
    on(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars);
        this.condition = `ON (${queryable.text})`;
        return this;
    }
    innerJoin(tableName, alias) {
        return new Join("INNER", this, tableName, undefined, alias, this.vars);
    }
    leftOuterJoin(tableName, alias) {
        return new Join("LEFT OUTER", this, tableName, undefined, alias, this.vars);
    }
    rightOuterJoin(tableName, alias) {
        return new Join("RIGHT OUTER", this, tableName, undefined, alias, this.vars);
    }
    fullOuterJoin(tableName, alias) {
        return new Join("FULL OUTER", this, tableName, undefined, alias, this.vars);
    }
    select(...params) {
        const initialiser = typeof params[params.length - 1] === "function" ? params.pop() : undefined;
        let input;
        if (params.length === 0)
            input = "*";
        else if (params.length !== 1 || typeof params[0] !== "object")
            input = Object.fromEntries(params.map(param => [param, param]));
        else
            input = params[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const query = new SelectFromJoin(this, input);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return initialiser?.(query) ?? query;
    }
    compileJoin() {
        if (this.type !== "INNER" && !this.condition)
            throw new Error(`Unable to join ${typeof this.table1 === "string" ? this.table1 : "(joined table)"} and ${this.table2}, no ON expression provided`);
        const type = this.type === "INNER" && !this.condition ? "CROSS" : this.type;
        const table1 = typeof this.table1 === "string" ? `${this.table1 ?? ""} ${this.alias1 ?? ""}`
            : this.table1.compileJoin();
        return `${table1} ${type} JOIN ${this.table2} ${this.alias2 ?? ""} ${this.condition ?? ""}`;
    }
    compile() {
        return new Statement_1.default.Queryable(this.compileJoin(), undefined, this.vars);
    }
}
exports.default = Join;
class SelectFromJoin extends Statement_1.default {
    constructor(join, columns) {
        super();
        this.join = join;
        this.columns = columns;
        this.vars = join["vars"];
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
    orderBy(column, order = "ASC") {
        this._orderByColumn = column;
        this._orderByDirection = order;
        return this;
    }
    offset(amount) {
        if (typeof amount !== "number")
            throw new Error("Unsafe value for offset");
        this._offset = amount;
        return this;
    }
    compile() {
        const orderBy = this._orderByColumn && this._orderByDirection ? `ORDER BY ${String(this._orderByColumn)} ${this._orderByDirection}` : "";
        const offset = this._offset ? `OFFSET ${this._offset}` : "";
        const limit = this._limit ? `LIMIT ${this._limit}` : "";
        const join = this.join.compile();
        const columns = this.columns === "*" ? "*"
            : Object.entries(this.columns)
                .map(([column, alias]) => column === alias ? column : `${column} ${alias}`)
                .join(",");
        return this.queryable(`SELECT ${columns} FROM ${join.text} ${this.condition ?? ""} ${orderBy} ${offset} ${limit}`, undefined, this.vars);
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
exports.SelectFromJoin = SelectFromJoin;
