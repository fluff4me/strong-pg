import { Pool, PoolClient, QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion, SortDirection } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";
export type SelectColumns<SCHEMA extends TableSchema> = "*" | Schema.Column<SCHEMA>[] | Partial<Record<Schema.Column<SCHEMA>, string>>;
type SelectResult<SCHEMA extends TableSchema, COLUMNS extends SelectColumns<SCHEMA> | 1> = COLUMNS extends 1 ? 1[] : COLUMNS extends Partial<Record<Schema.Column<SCHEMA>, string>> ? {
    [K in keyof COLUMNS as COLUMNS[K] & PropertyKey]: OutputTypeFromString<SCHEMA[K & Schema.Column<SCHEMA>]>;
} : (COLUMNS extends any[] ? COLUMNS[number] : Schema.Column<SCHEMA>) extends infer COLUMNS ? {
    [K in COLUMNS & PropertyKey]: OutputTypeFromString<SCHEMA[K & keyof SCHEMA]>;
} : never;
export type Order<SCHEMA extends TableSchema> = [column: Schema.Column<SCHEMA>, order?: SortDirection] | [null: null, column: Schema.Column<SCHEMA>, order?: SortDirection];
export declare namespace Order {
    function resolve<SCHEMA extends TableSchema>(order?: Order<SCHEMA>[]): string;
}
type SelectWhereVars<SCHEMA extends TableSchema, NAME extends string> = Schema.Columns<SCHEMA> extends infer BASE ? BASE & {
    [KEY in keyof BASE as KEY extends string ? `${NAME}.${KEY}` : never]: BASE[KEY];
} : never;
export declare class SelectFromVirtualTable<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends SelectColumns<SCHEMA> | 1 = Schema.Column<SCHEMA>[], RESULT = SelectResult<SCHEMA, COLUMNS>[]> extends Statement<RESULT> {
    private readonly from;
    readonly columns: COLUMNS;
    private vars;
    constructor(from: VirtualTable<SCHEMA, NAME> | string, columns: COLUMNS);
    private condition?;
    where(initialiser: ExpressionInitialiser<SelectWhereVars<SCHEMA, NAME>, boolean>): this;
    private _limit?;
    limit(count: 1): SelectFromVirtualTable<SCHEMA, NAME, COLUMNS, SelectResult<SCHEMA, COLUMNS> | undefined>;
    limit(count?: number): SelectFromVirtualTable<SCHEMA, NAME, COLUMNS, SelectResult<SCHEMA, COLUMNS>[]>;
    private _orderBy?;
    orderBy(column: Schema.Column<SCHEMA>, order?: SortDirection): this;
    orderBy(orders: Order<SCHEMA>[]): this;
    private _offset?;
    offset(amount?: number): this;
    compile(): Statement.Queryable[];
    private compileWith;
    queryOne(pool: Pool | PoolClient): Promise<SelectResult<SCHEMA, COLUMNS> | undefined>;
    protected resolveQueryOutput(output: QueryResult<any>): any;
}
export default class SelectFromTable<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends SelectColumns<SCHEMA> | 1 = "*"> extends SelectFromVirtualTable<SCHEMA, NAME, COLUMNS> {
    readonly tableName: NAME;
    readonly schema: SCHEMA;
    constructor(tableName: NAME, schema: SCHEMA, columns: COLUMNS);
    primaryKeyed(id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>, initialiser?: ExpressionInitialiser<SelectWhereVars<SCHEMA, NAME>, boolean>): SelectFromVirtualTable<SCHEMA, NAME, COLUMNS, SelectResult<SCHEMA, COLUMNS> | undefined>;
}
export {};
