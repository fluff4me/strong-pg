import { ClientOrPool } from "./IStrongPG";
import Statement from "./Statement";
export default class Transaction extends Statement {
    protected readonly statements: Statement[];
    add(statement: Statement): this;
    execute(pool: ClientOrPool): Promise<import("pg").QueryResult<any>>;
    compile(): string;
}
