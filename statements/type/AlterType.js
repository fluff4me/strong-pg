"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IStrongPG_1 = require("../../IStrongPG");
const Statement_1 = __importDefault(require("../Statement"));
class AlterType extends Statement_1.default.Super {
    constructor(name) {
        super();
        this.name = name;
    }
    add(name, type) {
        return this.do(AlterTypeSubStatement.addAttributes(name, type));
    }
    do(...operations) {
        return this.addParallelOperation(...operations);
    }
    compileOperation(operation) {
        return `ALTER TYPE ${this.name} ${operation}`;
    }
}
exports.default = AlterType;
class AlterTypeSubStatement extends Statement_1.default {
    static addAttributes(column, type) {
        return new AlterTypeSubStatement(`ADD ATTRIBUTE ${column} ${IStrongPG_1.TypeString.resolve(type)}`);
    }
    static renameAttribute(oldAttribute, newAttribute) {
        return new AlterTypeSubStatement(`RENAME ATTRIBUTE ${oldAttribute} TO ${newAttribute}`);
    }
    static dropAttribute(attribute) {
        return new AlterTypeSubStatement(`DROP ATTRIBUTE ${attribute}`);
    }
    static alterAttribute(attribute, type) {
        return new AlterTypeSubStatement(`ALTER ATTRIBUTE ${attribute} SET DATA TYPE ${IStrongPG_1.TypeString.resolve(type)}`);
    }
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    compile() {
        return this.queryable(this.compiled);
    }
}
