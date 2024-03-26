import Statement from "./Statement";
export default class TruncateTable extends Statement<[]> {
    readonly tableName: string | undefined;
    constructor(tableName: string | undefined);
    compile(): Statement.Queryable[];
}
