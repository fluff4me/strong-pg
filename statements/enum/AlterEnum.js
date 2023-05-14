"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../Statement"));
class AlterEnum extends Statement_1.default.Super {
    constructor(name) {
        super();
        this.name = name;
    }
    add(...values) {
        return this.do(...AlterEnumSubStatement.addValues(...values));
    }
    addBefore(newValue, pivotValue) {
        return this.do(AlterEnumSubStatement.addValueBefore(newValue, pivotValue));
    }
    addAfter(newValue, pivotValue) {
        return this.do(AlterEnumSubStatement.addValueAfter(newValue, pivotValue));
    }
    rename(value, newValue) {
        return this.do(AlterEnumSubStatement.renameValue(value, newValue));
    }
    do(...statements) {
        return this.addStandaloneOperation(...statements);
    }
    compileOperation(operation) {
        return `ALTER TYPE ${this.name} ${operation}`;
    }
}
exports.default = AlterEnum;
class AlterEnumSubStatement extends Statement_1.default {
    static addValues(...values) {
        return values.map(value => new AlterEnumSubStatement(`ADD VALUE '${value}'`));
    }
    static renameValue(oldValue, newValue) {
        return new AlterEnumSubStatement(`RENAME VALUE ${oldValue} TO ${newValue}`);
    }
    static addValueBefore(newValue, pivotValue) {
        return new AlterEnumSubStatement(`ADD VALUE ${newValue} BEFORE ${pivotValue}`);
    }
    static addValueAfter(newValue, pivotValue) {
        return new AlterEnumSubStatement(`ADD VALUE ${newValue} AFTER ${pivotValue}`);
    }
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    compile() {
        return this.queryable(this.compiled);
    }
}
