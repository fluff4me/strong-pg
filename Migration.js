import AlterTable from "./statements/table/AlterTable";
import CreateTable from "./statements/table/CreateTable";
import Transaction from "./Transaction";
export default class Migration extends Transaction {
    constructor(schemaStart) {
        super();
        this.schemaStart = schemaStart;
    }
    createTable(table, initialiser) {
        this.add(new CreateTable(table));
        this.add(initialiser(new AlterTable(table)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    alterTable(table, initialiser) {
        this.add(initialiser(new AlterTable(table)));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    schema(schema) {
        this.schemaEnd = schema;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
}
