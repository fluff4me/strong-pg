"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("../expressions/Expression"));
const VirtualTable_1 = require("../VirtualTable");
class Recursive extends VirtualTable_1.VirtualTable {
    constructor(tableName, columnNames) {
        super(`vt_recursive_${tableName}`);
        this.tableName = tableName;
        this.columnNames = columnNames;
    }
    where(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars);
        this.anchorCondition = `WHERE (${queryable.text})`;
        return this;
    }
    thenWhere(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars, name => this.columnNames.includes(name) ? `recursive_table.${name}` : name);
        this.recursiveCondition = `WHERE (${queryable.text})`;
        return this;
    }
    searchBy(column, type, direction) {
        this.search = { column, type, direction };
        return this;
    }
    selectInitialiser(query) {
        if (this.search)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            query.orderBy("with_recursive_search_order", this.search.direction);
    }
    compileWith() {
        if (!this.recursiveCondition)
            throw new Error("A recursive condition is required");
        const anchorQuery = `SELECT ${this.columnNames.join(",")} FROM ${this.tableName} ${this.anchorCondition ?? ""}`;
        const recursiveQuery = `SELECT ${this.columnNames.map(name => `recursive_table.${String(name)}`).join(",")} FROM ${this.tableName} recursive_table, ${this.name} current`;
        const searchQuery = !this.search ? "" : `SEARCH ${this.search.type.description} FIRST BY ${String(this.search.column)} SET with_recursive_search_order`;
        return `RECURSIVE ${this.name}(${this.columnNames.join(",")}) AS (${anchorQuery} UNION ALL ${recursiveQuery}) ${searchQuery}`;
    }
}
exports.default = Recursive;
