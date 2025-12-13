import Statement from './Statement';
export default class TruncateTable extends Statement<[]> {
    readonly tableName: string | undefined;
    constructor(tableName: string | undefined);
    private shouldCascade?;
    cascade(): this;
    compile(): Statement.Queryable[];
}
