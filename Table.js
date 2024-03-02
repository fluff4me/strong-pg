"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Select_1 = __importDefault(require("./statements/Select"));
class Table {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
    select(...params) {
        const initialiser = typeof params[params.length - 1] === "function" ? params.pop() : undefined;
        const query = new Select_1.default(this.name, this.schema, params);
        initialiser?.(query);
        return query;
    }
}
exports.default = Table;
