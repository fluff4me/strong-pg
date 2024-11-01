import { ExpressionInitialiser } from "../expressions/Expression";
import { SearchType, SortDirection } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import { SelectFromVirtualTable } from "./Select";
export default class Recursive<TABLE extends TableSchema, VIRTUAL_TABLE extends TableSchema> extends VirtualTable<VIRTUAL_TABLE> {
    private readonly tableName;
    private readonly columnNames;
    constructor(tableName: string, columnNames: Schema.Column<TABLE>[]);
    private anchorCondition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<TABLE>, boolean>): this;
    private recursiveCondition?;
    thenWhere(initialiser: ExpressionInitialiser<Schema.Columns<TABLE> & Schema.Columns<TABLE, {
        [KEY in Schema.Column<TABLE>]: `current.${KEY & (string | number)}`;
    }>, boolean>): this;
    private search?;
    searchBy(column: Schema.Column<VIRTUAL_TABLE>, type: SearchType, direction?: SortDirection): this;
    protected selectInitialiser(query: SelectFromVirtualTable<VIRTUAL_TABLE, "*">): void;
    compileWith(): string;
}
