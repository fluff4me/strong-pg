"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("./Statement"));
class TruncateTable extends Statement_1.default {
    constructor(tableName) {
        super();
        this.tableName = tableName;
    }
    cascade() {
        this.shouldCascade = true;
        return this;
    }
    compile() {
        return this.queryable(`TRUNCATE ${this.tableName ?? ''} ${this.shouldCascade ? 'CASCADE' : ''}`);
    }
}
exports.default = TruncateTable;
