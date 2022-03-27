"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AlterEnum_1 = __importDefault(require("./statements/enum/AlterEnum"));
const CreateEnum_1 = __importDefault(require("./statements/enum/CreateEnum"));
const DropEnum_1 = __importDefault(require("./statements/enum/DropEnum"));
const CreateIndex_1 = __importDefault(require("./statements/index/CreateIndex"));
const DropIndex_1 = __importDefault(require("./statements/index/DropIndex"));
const AlterTable_1 = __importDefault(require("./statements/table/AlterTable"));
const CreateTable_1 = __importDefault(require("./statements/table/CreateTable"));
const DropTable_1 = __importDefault(require("./statements/table/DropTable"));
const RenameTable_1 = __importDefault(require("./statements/table/RenameTable"));
const CreateTrigger_1 = __importDefault(require("./statements/trigger/CreateTrigger"));
const DropTrigger_1 = __importDefault(require("./statements/trigger/DropTrigger"));
const RenameTrigger_1 = __importDefault(require("./statements/trigger/RenameTrigger"));
const Transaction_1 = __importDefault(require("./Transaction"));
class Migration extends Transaction_1.default {
    constructor(schemaStart) {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.schemaStart = schemaStart;
    }
    createTable(table, alter) {
        this.add(new CreateTable_1.default(table));
        this.add(alter(new AlterTable_1.default(table)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterTable(table, alter) {
        this.add(alter(new AlterTable_1.default(table)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    renameTable(table, newName) {
        this.add(new RenameTable_1.default(table, newName));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropTable(table) {
        this.add(new DropTable_1.default(table));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    createIndex(name, on, initialiser) {
        const createIndex = new CreateIndex_1.default(name, on);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(createIndex);
        this.add(createIndex);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropIndex(name) {
        this.add(new DropIndex_1.default(name));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    createEnum(name, alter) {
        this.add(new CreateEnum_1.default(name));
        this.add(alter(new AlterEnum_1.default(name)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterEnum(name, alter) {
        this.add(alter(new AlterEnum_1.default(name)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropEnum(name) {
        this.add(new DropEnum_1.default(name));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    createTrigger(on, name, initialiser) {
        const createTrigger = new CreateTrigger_1.default(name, on);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(createTrigger);
        this.add(createTrigger);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    renameTrigger(on, name, newName) {
        this.add(new RenameTrigger_1.default(on, name, newName));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropTrigger(on, name) {
        this.add(new DropTrigger_1.default(on, name));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    schema(schema) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.schemaEnd = schema;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
}
exports.default = Migration;
