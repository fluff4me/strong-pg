import sql from "../sql";
import Statement from "./Statement";
export default class Do extends Statement {
    private readonly sql;
    constructor(sql: sql);
    compile(): Statement.Queryable | Statement.Queryable[];
}
