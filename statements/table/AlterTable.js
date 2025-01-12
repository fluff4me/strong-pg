"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterColumnSetType = exports.AlterColumn = exports.CreateColumn = void 0;
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
    declare() {
        return this;
    }
    doStandalone(...operations) {
        return this.addStandaloneOperation(...operations);
    }
    addColumn(name, type, initialiser) {
        return this.do(AlterTableSubStatement.addColumn(name, type, initialiser));
    }
    declareColumn(name, type) {
        return this.declare();
    }
    alterColumn(name, initialiser) {
        return this.do(AlterTableSubStatement.alterColumn(name, initialiser));
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
    foreignKey(column, foreignTable, foreignKey, cascade) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.do(AlterTableSubStatement.addForeignKey(column, foreignTable, foreignKey, cascade));
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
        const expr = Expression_1.default.compile(value);
        return new AlterTableSubStatement(`ADD CONSTRAINT ${id}_check CHECK (${expr.text})`, expr.values);
    }
    static addForeignKey(column, foreignTable, foreignColumn, cascade) {
        const cascadeString = !cascade ? "" : "ON DELETE CASCADE";
        return new AlterTableSubStatement(`ADD CONSTRAINT ${column}_fk FOREIGN KEY (${column}) REFERENCES ${foreignTable} (${foreignColumn}) ${cascadeString}`);
    }
    static addUnique(name, index) {
        return new AlterTableSubStatement(`ADD CONSTRAINT ${name} UNIQUE USING INDEX ${index}`);
    }
    constructor(compiled, vars) {
        super();
        this.compiled = compiled;
        this.vars = vars;
    }
    compile() {
        return this.queryable(this.compiled, undefined, this.vars);
    }
}
// export class ColumnReference<TYPE extends TypeString> {
// 	public constructor (public readonly table: string, public readonly column: string) {
// 	}
// }
class CreateColumn extends Statement_1.default.Super {
    default(value) {
        if (value === null)
            return this;
        else
            return this.addStandaloneOperation(CreateColumnSubStatement.setDefault(value));
    }
    notNull() {
        return this.addStandaloneOperation(CreateColumnSubStatement.setNotNull());
    }
    collate(collation) {
        // put it first
        this.standaloneOperations.unshift(CreateColumnSubStatement.setCollation(collation));
        return this;
    }
    compileOperation(operation) {
        return operation;
    }
}
exports.CreateColumn = CreateColumn;
class CreateColumnSubStatement extends Statement_1.default {
    /**
     * Warning: Do not use this outside of migrations
     */
    static setDefault(value) {
        const expr = typeof value === "function" ? Expression_1.default.compile(value) : undefined;
        const stringifiedValue = expr?.text ?? Expression_1.default.stringifyValueRaw(value);
        return new CreateColumnSubStatement(`DEFAULT (${stringifiedValue})`, expr?.values);
    }
    static setNotNull() {
        return new CreateColumnSubStatement("NOT NULL");
    }
    static setCollation(collation) {
        return new CreateColumnSubStatement(`COLLATE ${collation}`);
    }
    constructor(compiled, vars) {
        super();
        this.compiled = compiled;
        this.vars = vars;
    }
    compile() {
        return this.queryable(this.compiled, undefined, this.vars);
    }
}
class AlterColumn extends Statement_1.default.Super {
    constructor(name) {
        super();
        this.name = name;
    }
    setType(type, initialiser) {
        return this.addStandaloneOperation(AlterColumnSubStatement.setType(type, initialiser));
    }
    setDefault(value) {
        if (value === null)
            return this.dropDefault();
        else
            return this.addStandaloneOperation(AlterColumnSubStatement.setDefault(value));
    }
    dropDefault() {
        return this.addStandaloneOperation(AlterColumnSubStatement.dropDefault());
    }
    setNotNull() {
        return this.addStandaloneOperation(AlterColumnSubStatement.setNotNull());
    }
    dropNotNull() {
        return this.addStandaloneOperation(AlterColumnSubStatement.dropNotNull());
    }
    compileOperation(operation) {
        return `ALTER COLUMN ${this.name} ${operation}`;
    }
}
exports.AlterColumn = AlterColumn;
class AlterColumnSubStatement extends Statement_1.default {
    /**
     * Warning: Do not use this outside of migrations
     */
    static setDefault(value) {
        const expr = typeof value === "function" ? Expression_1.default.compile(value) : undefined;
        const stringifiedValue = expr?.text ?? Expression_1.default.stringifyValueRaw(value);
        return new AlterColumnSubStatement(`SET DEFAULT (${stringifiedValue})`, expr?.values);
    }
    static dropDefault() {
        return new AlterColumnSubStatement("DROP DEFAULT");
    }
    static setNotNull() {
        return new AlterColumnSubStatement("SET NOT NULL");
    }
    static dropNotNull() {
        return new AlterColumnSubStatement("DROP NOT NULL");
    }
    static setType(type, initialiser) {
        const setType = new AlterColumnSetType(type);
        initialiser?.(setType);
        return setType;
    }
    constructor(compiled, vars) {
        super();
        this.compiled = compiled;
        this.vars = vars;
    }
    compile() {
        return this.queryable(this.compiled, undefined, this.vars);
    }
}
class AlterColumnSetType extends Statement_1.default.Super {
    constructor(type) {
        super();
        this.type = type;
        this.addParallelOperation(AlterColumnSetTypeSubStatement.type(type));
    }
    using() {
        return this.addParallelOperation(AlterColumnSetTypeSubStatement.using());
    }
    // TODO collate
    compileOperation(operation) {
        return `${operation}`;
    }
    joinParallelOperations(operations) {
        return operations.join(" ");
    }
}
exports.AlterColumnSetType = AlterColumnSetType;
class AlterColumnSetTypeSubStatement extends Statement_1.default {
    static type(type) {
        return new AlterColumnSetTypeSubStatement(`TYPE ${type}`);
    }
    static using() {
        // TODO
        return new AlterColumnSetTypeSubStatement("USING");
    }
    constructor(compiled, vars) {
        super();
        this.compiled = compiled;
        this.vars = vars;
    }
    compile() {
        return this.queryable(this.compiled, undefined, this.vars);
    }
}
