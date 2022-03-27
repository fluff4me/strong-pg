"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../Statement"));
class RenameTrigger extends Statement_1.default.Basic {
    constructor(on, name, newName) {
        super(`ALTER TRIGGER ${name} ON ${on} RENAME TO ${newName}`);
    }
}
exports.default = RenameTrigger;
