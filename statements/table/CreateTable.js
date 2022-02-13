import Statement from "../../Statement";
export default class CreateTable extends Statement {
    constructor(table) {
        super();
        this.table = table;
    }
    compile() {
        return `CREATE TABLE ${this.table}`;
    }
}
