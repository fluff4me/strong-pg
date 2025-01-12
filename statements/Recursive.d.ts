import { ExpressionInitialiser } from "../expressions/Expression";
import { SearchType, SortDirection } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import { Order, SelectFromVirtualTable } from "./Select";
export default class Recursive<TABLE extends TableSchema, VIRTUAL_TABLE extends TableSchema, NAME extends string> extends VirtualTable<VIRTUAL_TABLE, never> {
    private readonly tableName;
    private readonly columnNames;
    constructor(tableName: NAME, columnNames: Schema.Column<TABLE>[]);
    private anchorCondition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<TABLE>, boolean>): this;
    private recursiveCondition?;
    thenWhere(initialiser: ExpressionInitialiser<Schema.Columns<TABLE> & Schema.Columns<TABLE, {
        [KEY in Schema.Column<TABLE>]: `current.${KEY & (string | number)}`;
    }>, boolean>): this;
    private search?;
    searchBy(type: SearchType, ...columns: Schema.Column<VIRTUAL_TABLE>[]): this;
    private _orderBy?;
    orderBy(column: Schema.Column<VIRTUAL_TABLE>, order?: SortDirection): this;
    orderBy(orders: Order<VIRTUAL_TABLE>[]): this;
    protected selectInitialiser(query: SelectFromVirtualTable<VIRTUAL_TABLE, "*">): void;
    compileWith(): string;
}
