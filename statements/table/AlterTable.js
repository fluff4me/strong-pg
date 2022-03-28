"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterColumn = void 0;
const Expression_1 = __importDefault(require("../../expressions/Expression"));
const IStrongPG_1 = require("../../IStrongPG");
const Statement_1 = __importDefault(require("../Statement"));
class AlterTable extends Statement_1.default.Super {
    constructor(table) {
        super();
        this.table = table;
    }
    do(...operations) {
        return this.addParallelOperation(...operations);
    }
    doStandalone(...operations) {
        return this.addStandaloneOperation(...operations);
    }
    addColumn(name, type, alter) {
        return this.do(AlterTableSubStatement.addColumn(name, type), ...alter ? [AlterTableSubStatement.alterColumn(name, alter)] : []);
    }
    dropColumn(name) {
        return this.do(AlterTableSubStatement.dropColumn(name));
    }
    renameColumn(name, newName) {
        return this.doStandalone(AlterTableSubStatement.renameColumn(name, newName));
    }
    addPrimaryKey(...keys) {
        return this.do(AlterTableSubStatement.addPrimaryKey(this.table, ...keys));
    }
    dropPrimaryKey() {
        return this.do(AlterTableSubStatement.dropPrimaryKey(this.table));
    }
    schema() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compileOperation(operation) {
        return `ALTER TABLE ${this.table} ${operation}`;
    }
}
exports.default = AlterTable;
class AlterTableSubStatement extends Statement_1.default {
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    static addColumn(column, type) {
        return new AlterTableSubStatement(`ADD COLUMN ${column} ${IStrongPG_1.TypeString.resolve(type)}`);
    }
    static alterColumn(column, initialiser) {
        const statement = new AlterColumn(column);
        initialiser(statement);
        return statement;
    }
    static dropColumn(column) {
        return new AlterTableSubStatement(`DROP COLUMN ${column}`);
    }
    static renameColumn(column, newName) {
        return new AlterTableSubStatement(`RENAME COLUMN ${column} TO ${newName}`);
    }
    static addPrimaryKey(table, ...keys) {
        return new AlterTableSubStatement(`ADD CONSTRAINT ${table}_pkey PRIMARY KEY (${keys.join(",")})`);
    }
    static dropPrimaryKey(table) {
        return new AlterTableSubStatement(`DROP CONSTRAINT ${table}_pkey`);
    }
    compile() {
        return this.compiled;
    }
}
// export class ColumnReference<TYPE extends TypeString> {
// 	public constructor (public readonly table: string, public readonly column: string) {
// 	}
// }
class AlterColumn extends Statement_1.default.Super {
    constructor(name) {
        super();
        this.name = name;
    }
    // public reference?: ColumnReference<TYPE>;
    // public setReferences (reference: ColumnReference<TYPE>) {
    // 	this.reference = reference;
    // 	return this;
    // }
    default(value) {
        return this.addStandaloneOperation(AlterColumnSubStatement.setDefault(value));
    }
    notNull() {
        return this.addStandaloneOperation(AlterColumnSubStatement.setNotNull());
    }
    compileOperation(operation) {
        return `ALTER COLUMN ${this.name} ${operation}`;
    }
}
exports.AlterColumn = AlterColumn;
class AlterColumnSubStatement extends Statement_1.default {
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    static setDefault(value) {
        const stringifiedValue = typeof value === "function" ? Expression_1.default.stringify(value) : Expression_1.default.stringifyValue(value);
        return new AlterColumnSubStatement(`SET DEFAULT (${stringifiedValue})`);
    }
    static setNotNull() {
        return new AlterColumnSubStatement("SET NOT NULL");
    }
    compile() {
        return this.compiled;
    }
}
