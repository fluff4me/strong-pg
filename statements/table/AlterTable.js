"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterColumn = exports.CreateColumn = void 0;
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
    addColumn(name, type, initialiser) {
        return this.do(AlterTableSubStatement.addColumn(name, type, initialiser));
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
    check(id, value) {
        return this.do(AlterTableSubStatement.addCheck(id, value));
    }
    foreignKey(column, foreignTable, foreignKey) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.do(AlterTableSubStatement.addForeignKey(column, foreignTable, foreignKey));
    }
    unique(name, index) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.do(AlterTableSubStatement.addUnique(name, index));
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
    static addColumn(column, type, initialiser) {
        const createColumn = new CreateColumn();
        initialiser?.(createColumn);
        const columnStuffs = !initialiser ? "" : ` ${createColumn.compile().map(query => query.text).join(" ")}`;
        return new AlterTableSubStatement(`ADD COLUMN ${column} ${IStrongPG_1.TypeString.resolve(type)}${columnStuffs}`);
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
    static addCheck(id, value) {
        const stringifiedValue = Expression_1.default.stringify(value);
        return new AlterTableSubStatement(`ADD CONSTRAINT ${id}_check CHECK (${stringifiedValue})`);
    }
    static addForeignKey(column, foreignTable, foreignColumn) {
        return new AlterTableSubStatement(`ADD CONSTRAINT ${column}_fk FOREIGN KEY (${column}) REFERENCES ${foreignTable} (${foreignColumn})`);
    }
    static addUnique(name, index) {
        return new AlterTableSubStatement(`ADD CONSTRAINT ${name} UNIQUE USING INDEX ${index}`);
    }
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    compile() {
        return this.queryable(this.compiled);
    }
}
// export class ColumnReference<TYPE extends TypeString> {
// 	public constructor (public readonly table: string, public readonly column: string) {
// 	}
// }
class CreateColumn extends Statement_1.default.Super {
    default(value) {
        return this.addStandaloneOperation(CreateColumnSubStatement.setDefault(value));
    }
    notNull() {
        return this.addStandaloneOperation(CreateColumnSubStatement.setNotNull());
    }
    collate(collation) {
        // put it first
        return this.standaloneOperations.unshift(CreateColumnSubStatement.setCollation(collation));
    }
    compileOperation(operation) {
        return operation;
    }
}
exports.CreateColumn = CreateColumn;
class CreateColumnSubStatement extends Statement_1.default {
    static setDefault(value) {
        const stringifiedValue = typeof value === "function" ? Expression_1.default.stringify(value) : Expression_1.default.stringifyValue(value);
        return new CreateColumnSubStatement(`DEFAULT (${stringifiedValue})`);
    }
    static setNotNull() {
        return new CreateColumnSubStatement("NOT NULL");
    }
    static setCollation(collation) {
        return new CreateColumnSubStatement(`COLLATE ${collation}`);
    }
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    compile() {
        return this.queryable(this.compiled);
    }
}
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
    static setDefault(value) {
        const stringifiedValue = typeof value === "function" ? Expression_1.default.stringify(value) : Expression_1.default.stringifyValue(value);
        return new AlterColumnSubStatement(`SET DEFAULT (${stringifiedValue})`);
    }
    static setNotNull() {
        return new AlterColumnSubStatement("SET NOT NULL");
    }
    constructor(compiled) {
        super();
        this.compiled = compiled;
    }
    compile() {
        return this.queryable(this.compiled);
    }
}
