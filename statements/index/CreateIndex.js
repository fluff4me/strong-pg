"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("../../expressions/Expression"));
const Statement_1 = __importDefault(require("../Statement"));
class CreateIndex extends Statement_1.default {
    constructor(name, on) {
        super();
        this.name = name;
        this.on = on;
        this.isUnique = false;
        this.isNullNotUnique = false;
        this.columns = [];
    }
    unique() {
        this.isUnique = true;
        return this;
    }
    column(column) {
        this.columns.push(column);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    expression(initialiser) {
        this.columns.push(Expression_1.default.compile(initialiser).text);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    nullNotUnique() {
        this.isNullNotUnique = true;
        return this;
    }
    compile() {
        return this.queryable(`CREATE${this.isUnique ? " UNIQUE" : ""} INDEX ${this.name} ON ${this.on} (${this.columns.join(", ")}) ${this.isUnique && this.isNullNotUnique ? "NULLS NOT DISTINCT" : ""}`);
    }
}
exports.default = CreateIndex;
