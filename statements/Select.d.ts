import { Pool, PoolClient, QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion, SortDirection } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";
export type SelectColumns<SCHEMA extends TableSchema> = "*" | Schema.Column<SCHEMA>[] | Partial<Record<Schema.Column<SCHEMA>, string>>;
type SelectResult<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA>> = COLUMNS extends Partial<Record<Schema.Column<SCHEMA>, string>> ? {
    [K in keyof COLUMNS as COLUMNS[K] & PropertyKey]: OutputTypeFromString<SCHEMA[K & Schema.Column<SCHEMA>]>;
} : (COLUMNS extends any[] ? COLUMNS[number] : Schema.Column<SCHEMA>) extends infer COLUMNS ? {
    [K in COLUMNS & PropertyKey]: OutputTypeFromString<SCHEMA[K & keyof SCHEMA]>;
} : never;
type Order<SCHEMA extends TableSchema> = [column: Schema.Column<SCHEMA>, order?: SortDirection] | [null: null, column: Schema.Column<SCHEMA>, order?: SortDirection];
export declare class SelectFromVirtualTable<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA> = Schema.Column<SCHEMA>[], RESULT = SelectResult<SCHEMA, COLUMNS>[]> extends Statement<RESULT> {
    private readonly from;
    readonly columns: COLUMNS;
    private vars;
    constructor(from: VirtualTable<SCHEMA> | string, columns: COLUMNS);
    private condition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): this;
    private _limit?;
    limit(count: 1): SelectFromVirtualTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS> | undefined>;
    limit(count: number): SelectFromVirtualTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS>[]>;
    private _orderBy?;
    orderBy(column: Schema.Column<SCHEMA>, order?: SortDirection): this;
    orderBy(orders: Order<SCHEMA>[]): this;
    private _offset?;
    offset(amount: number): this;
    compile(): Statement.Queryable[];
    private compileWith;
    queryOne(pool: Pool | PoolClient): Promise<SelectResult<SCHEMA, COLUMNS> | undefined>;
    protected resolveQueryOutput(output: QueryResult<any>): any;
}
export default class SelectFromTable<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA> = "*"> extends SelectFromVirtualTable<SCHEMA, COLUMNS> {
    readonly tableName: string;
    readonly schema: SCHEMA;
    constructor(tableName: string, schema: SCHEMA, columns: COLUMNS);
    primaryKeyed(id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>, initialiser?: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): SelectFromVirtualTable<SCHEMA, COLUMNS, SelectResult<SCHEMA, COLUMNS> | undefined>;
}
export {};
