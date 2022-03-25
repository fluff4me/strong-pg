"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../Statement"));
class CreateTable extends Statement_1.default {
    constructor(table) {
        super();
        this.table = table;
    }
    compile() {
        return `CREATE TABLE ${this.table} ()`;
    }
}
exports.default = CreateTable;
