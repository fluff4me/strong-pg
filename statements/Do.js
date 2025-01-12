"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("./Statement"));
class Do extends Statement_1.default {
    constructor(sql) {
        super();
        this.sql = sql;
    }
    compile() {
        return this.queryable(this.sql.text);
    }
}
exports.default = Do;
