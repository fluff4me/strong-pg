"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("./expressions/Expression"));
const VirtualTable_1 = require("./VirtualTable");
class FunctionCall extends VirtualTable_1.VirtualTable {
    constructor(functionName, params) {
        super(null);
        this.functionName = functionName;
        this.compileWith = undefined;
        this.params = params.map(param => Expression_1.default.stringifyValue(param, this.vars));
    }
    compileFrom() {
        return `${this.functionName}(${this.params.join(",")})`;
    }
}
exports.default = FunctionCall;
