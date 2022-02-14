"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AlterTable_1 = __importDefault(require("./statements/table/AlterTable"));
const CreateTable_1 = __importDefault(require("./statements/table/CreateTable"));
const DropTable_1 = __importDefault(require("./statements/table/DropTable"));
const Transaction_1 = __importDefault(require("./Transaction"));
class Migration extends Transaction_1.default {
    constructor(schemaStart) {
        super();
        this.schemaStart = schemaStart;
    }
    createTable(table, initialiser) {
        this.add(new CreateTable_1.default(table));
        this.add(initialiser(new AlterTable_1.default(table)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterTable(table, initialiser) {
        this.add(initialiser(new AlterTable_1.default(table)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    dropTable(table) {
        this.add(new DropTable_1.default(table));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    schema(schema) {
        this.schemaEnd = schema;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
}
exports.default = Migration;
