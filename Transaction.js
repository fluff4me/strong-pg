import Statement from "./Statement";
export default class Transaction extends Statement {
    constructor() {
        super(...arguments);
        this.statements = [];
    }
    add(statement) {
        this.statements.push(statement);
        return this;
    }
    async execute(pool) {
        return pool.query(`BEGIN;${this.compile()}COMMIT;`);
    }
    compile() {
        return this.statements.join(";");
    }
}
