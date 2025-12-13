"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = __importDefault(require("../sql"));
class Values {
    constructor(name, columns) {
        this.name = name;
        this.columns = columns;
        this.data = [];
        this.typeStrings = [];
    }
    types(...types) {
        this.typeStrings = types;
        return this;
    }
    values(...rows) {
        this.data.push(...rows);
        return this;
    }
    compile() {
        const rows = this.data.map((values, index) => {
            if (!index) {
                // explicitly cast types for first row
                const castedValues = values.map((value, index) => (0, sql_1.default) `${value}::${sql_1.default.raw(this.typeStrings[index])}`);
                return (0, sql_1.default) `(${sql_1.default.join(castedValues, (0, sql_1.default) `,`)})`;
            }
            return (0, sql_1.default) `(${sql_1.default.join(values, (0, sql_1.default) `,`)})`;
        });
        const as = ` AS ${this.name} (${this.columns.join(',')})`;
        return (0, sql_1.default) `(VALUES ${sql_1.default.join(rows, (0, sql_1.default) `,`)})${sql_1.default.raw(as)}`;
    }
}
exports.default = Values;
