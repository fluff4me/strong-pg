"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnAddition = exports.ColumnReference = void 0;
const Transaction_1 = __importDefault(require("../../Transaction"));
class AlterTable extends Transaction_1.default {
    constructor(table) {
        super();
        this.table = table;
        this.operations = [];
        this.standaloneOperations = [];
    }
    do(operation) {
        this.operations.push(operation);
        return this;
    }
    doStandalone(operation) {
        this.standaloneOperations.push(operation);
        return this;
    }
    addColumn(name, type, initialiser) {
        const column = new ColumnAddition(name, type);
        initialiser?.(column);
        return this.do(`ADD COLUMN ${name} ${type}`);
    }
    dropColumn(name) {
        return this.do(`DROP COLUMN ${name}`);
    }
    renameColumn(name, newName) {
        return this.doStandalone(`RENAME COLUMN ${name} TO ${newName}`);
    }
    addPrimaryKey(...keys) {
        return this.do(`ADD CONSTRAINT table_pkey PRIMARY KEY (${keys.join(",")})`);
    }
    dropPrimaryKey() {
        return this.do("DROP CONSTRAINT table_pkey");
    }
    renameTo(newName) {
        this.standaloneOperations.push(`RENAME TO ${newName}`);
        return this;
    }
    schema() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        return [this.operations.join(","), ...this.standaloneOperations]
            .map(operation => `ALTER TABLE ${this.table} ${operation}`);
    }
}
exports.default = AlterTable;
class ColumnReference {
    constructor(table, column) {
        this.table = table;
        this.column = column;
    }
}
exports.ColumnReference = ColumnReference;
class ColumnAddition {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
    setReferences(reference) {
        this.reference = reference;
        return this;
    }
}
exports.ColumnAddition = ColumnAddition;
