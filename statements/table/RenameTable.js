"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../Statement"));
class RenameTable extends Statement_1.default.Basic {
    constructor(name, newName) {
        super(`ALTER TABLE ${name} RENAME TO ${newName}`);
    }
}
exports.default = RenameTable;
