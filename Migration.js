"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationCommit = void 0;
const IStrongPG_1 = require("./IStrongPG");
const CreateCollation_1 = __importDefault(require("./statements/collation/CreateCollation"));
const DropCollation_1 = __importDefault(require("./statements/collation/DropCollation"));
const Do_1 = __importDefault(require("./statements/Do"));
const AlterEnum_1 = __importDefault(require("./statements/enum/AlterEnum"));
const CreateEnum_1 = __importDefault(require("./statements/enum/CreateEnum"));
const DropEnum_1 = __importDefault(require("./statements/enum/DropEnum"));
const CreateOrReplaceFunction_1 = __importDefault(require("./statements/function/CreateOrReplaceFunction"));
const DropFunction_1 = __importDefault(require("./statements/function/DropFunction"));
const CreateIndex_1 = __importDefault(require("./statements/index/CreateIndex"));
const DropIndex_1 = __importDefault(require("./statements/index/DropIndex"));
const AlterTable_1 = __importDefault(require("./statements/table/AlterTable"));
const CreateTable_1 = __importDefault(require("./statements/table/CreateTable"));
const DropTable_1 = __importDefault(require("./statements/table/DropTable"));
const RenameTable_1 = __importDefault(require("./statements/table/RenameTable"));
const CreateTrigger_1 = __importDefault(require("./statements/trigger/CreateTrigger"));
const DropTrigger_1 = __importDefault(require("./statements/trigger/DropTrigger"));
const RenameTrigger_1 = __importDefault(require("./statements/trigger/RenameTrigger"));
const AlterType_1 = __importDefault(require("./statements/type/AlterType"));
const CreateType_1 = __importDefault(require("./statements/type/CreateType"));
const DropType_1 = __importDefault(require("./statements/type/DropType"));
const Transaction_1 = __importDefault(require("./Transaction"));
class Migration extends Transaction_1.default {
    constructor(schemaStart) {
        super();
        this.commits = [];
        this.file = IStrongPG_1.StackUtil.getCallerFile();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.schemaStart = schemaStart;
    }
    then(statementSupplier) {
        this.add(() => {
            if (typeof statementSupplier === 'function')
                return statementSupplier(this.db);
            return new Do_1.default(statementSupplier);
        });
        return this;
    }
    ////////////////////////////////////
    //#region Table
    createTable(table, alter) {
        this.add(new CreateTable_1.default(table).setCaller());
        this.add(alter(new AlterTable_1.default(table)).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterTable(table, alter) {
        this.add(alter(new AlterTable_1.default(table)).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    renameTable(table, newName) {
        this.add(new RenameTable_1.default(table, newName).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropTable(table) {
        this.add(new DropTable_1.default(table).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    //#endregion
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Type
    createType(type, alter) {
        this.add(new CreateType_1.default(type).setCaller());
        this.add(alter(new AlterType_1.default(type)).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterType(type, alter) {
        this.add(alter(new AlterType_1.default(type)).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropType(type) {
        this.add(new DropType_1.default(type).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    //#endregion 
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Index
    createIndex(name, on, initialiser) {
        const createIndex = new CreateIndex_1.default(name, on).setCaller();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(createIndex);
        this.add(createIndex);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropIndex(name) {
        this.add(new DropIndex_1.default(name).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    setIndexDropped(name) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    //#endregion
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Enum
    createEnum(name, alter) {
        this.add(new CreateEnum_1.default(name).setCaller());
        this.add(alter(new AlterEnum_1.default(name)).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterEnum(name, alter) {
        this.add(alter(new AlterEnum_1.default(name)).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropEnum(name) {
        this.add(new DropEnum_1.default(name).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    //#endregion
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Trigger
    createOrReplaceTrigger(on, name, initialiser) {
        const createTrigger = new CreateTrigger_1.default(name, on).setCaller();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(createTrigger);
        this.add(createTrigger);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    createConstraintTrigger(on, name, initialiser) {
        const createTrigger = new CreateTrigger_1.default(name, on, true).setCaller();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(createTrigger);
        this.add(createTrigger);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    renameTrigger(on, name, newName) {
        this.add(new RenameTrigger_1.default(on, name, newName).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropTrigger(on, name) {
        this.add(new DropTrigger_1.default(on, name).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    createOrReplaceFunction(name, initialiser) {
        if (typeof initialiser === 'function')
            this.add(initialiser(new CreateOrReplaceFunction_1.default(name)).setCaller());
        else {
            const createOrReplaceFunction = new CreateOrReplaceFunction_1.default(name).setCaller();
            for (const [type, name] of initialiser.in)
                createOrReplaceFunction.in(type, name);
            for (const [type, name] of initialiser.out)
                createOrReplaceFunction.out(type, name);
            createOrReplaceFunction.returns(initialiser.return);
            if (initialiser.sql && initialiser.plpgsql)
                throw new Error('Cannot provide both SQL and PL/pgSQL code for a function');
            if (initialiser.sql)
                createOrReplaceFunction.sql(initialiser.sql);
            if (initialiser.plpgsql)
                createOrReplaceFunction.plpgsql(initialiser.declarations, initialiser.plpgsql);
            this.add(createOrReplaceFunction);
        }
        return this;
    }
    dropFunction(name) {
        this.add(new DropFunction_1.default(name).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    //#endregion
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Collation
    createCollation(name, provider, locale, deterministic) {
        this.add(new CreateCollation_1.default(name, provider, locale, deterministic).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropCollation(name) {
        this.add(new DropCollation_1.default(name).setCaller());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    //#endregion 
    ////////////////////////////////////
    commit() {
        if (!this.statements.length)
            return this;
        const transaction = new MigrationCommit(this.file, !!this.commits.length);
        for (const statement of this.statements)
            transaction.add(statement);
        this.statements.splice(0, Infinity);
        this.commits.push(transaction);
        return this;
    }
    getCommits() {
        this.commit();
        return this.commits;
    }
    schema(schema) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.schemaEnd = schema;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
}
exports.default = Migration;
class MigrationCommit extends Transaction_1.default {
    constructor(file, virtual) {
        super();
        this.file = file;
        this.virtual = virtual;
    }
}
exports.MigrationCommit = MigrationCommit;
