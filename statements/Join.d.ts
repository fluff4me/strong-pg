import { Pool, PoolClient, QueryResult } from "pg";
import { Initialiser, OutputTypeFromString } from "../IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "../Schema";
import { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";
declare enum JoinType {
    Inner = 0,
    "Left Outer" = 1,
    "Full Outer" = 2,
    "Right Outer" = 3
}
type JoinTypeName = Uppercase<keyof typeof JoinType>;
export type JoinColumns<TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> = Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ? Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ? Exclude<TABLE1_COLUMNS, TABLE2_COLUMNS> | Exclude<TABLE2_COLUMNS, TABLE1_COLUMNS> extends infer COLUMNS_UNION ? COLUMNS_UNION | (TABLE1_NAME extends "" ? never : `${TABLE1_NAME}.${TABLE1_COLUMNS}`) | `${TABLE2_NAME}.${TABLE2_COLUMNS}` : never : never : never;
export type JoinTables<TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> = Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ? Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ? JoinColumns<TABLE1, TABLE2, TABLE1_NAME, TABLE2_NAME> extends infer COLUMNS extends string ? {
    [COLUMN in COLUMNS]: COLUMN extends TABLE1_COLUMNS ? TABLE1[COLUMN] : COLUMN extends TABLE2_COLUMNS ? TABLE2[COLUMN] : COLUMN extends `${TABLE1_NAME}.${infer BASENAME extends TABLE1_COLUMNS}` ? TABLE1[BASENAME] : COLUMN extends `${TABLE2_NAME}.${infer BASENAME extends TABLE2_COLUMNS}` ? TABLE2[BASENAME] : never;
} : never : never : never;
export default class Join<DATABASE extends DatabaseSchema, VIRTUAL_TABLE extends TableSchema> extends Statement {
    private readonly type;
    private readonly table1;
    private readonly table2;
    private readonly alias1?;
    private readonly alias2?;
    private vars;
    constructor(type: JoinTypeName, table1: string | undefined, table2: string, alias1?: string | undefined, alias2?: string | undefined);
    private condition?;
    on(initialiser: ExpressionInitialiser<Schema.Columns<VIRTUAL_TABLE>, boolean>): this;
    innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>>;
    /**
     * SELECT *
     */
    select(): SelectFromJoin<VIRTUAL_TABLE, "*"[]>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]>(...columns: COLUMNS): SelectFromJoin<VIRTUAL_TABLE, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromJoin<VIRTUAL_TABLE, "*"[], any> = SelectFromJoin<VIRTUAL_TABLE, "*"[]>>(initialiser: Initialiser<SelectFromJoin<VIRTUAL_TABLE, "*"[]>, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromJoin<VIRTUAL_TABLE, COLUMNS, any>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromJoin<VIRTUAL_TABLE, COLUMNS>, RETURN>]): RETURN;
    compile(): Statement.Queryable;
}
type JoinedTablesOutput<TABLE extends TableSchema, COLUMNS extends (Schema.Column<TABLE> | "*")[]> = "*" extends COLUMNS[number] ? Schema.Column<TABLE> : Exclude<COLUMNS[number], "*"> extends infer COLUMNS extends Schema.Column<TABLE> ? ({
    [COLUMN in COLUMNS as (COLUMN extends `${string}.${infer REAL_COLUMN}` ? Extract<Exclude<COLUMNS, COLUMN>, `${string}.${REAL_COLUMN}`> extends infer OTHER_COLUMNS ? [OTHER_COLUMNS] extends [never] ? REAL_COLUMN : `strong-pg error: Unable to resolve duplicate column name: ${Extract<COLUMN | OTHER_COLUMNS, string>}` : never : COLUMN)]: OutputTypeFromString<TABLE[COLUMN]>;
}) extends infer RESULT ? [
    Extract<keyof RESULT, `strong-pg error:${string}`>
] extends infer ERROR ? ERROR extends [never] ? RESULT : ERROR extends [`strong-pg error: ${infer ERROR_TEXT}`] ? ERROR_TEXT : never : never : never : never;
export declare class SelectFromJoin<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[] = Schema.Column<SCHEMA>[], RESULT = JoinedTablesOutput<SCHEMA, COLUMNS>[]> extends Statement<RESULT> {
    private readonly join;
    readonly columns: COLUMNS;
    private vars;
    constructor(join: Join<DatabaseSchema, TableSchema>, columns: COLUMNS);
    private condition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): this;
    private _limit?;
    limit(count: 1): SelectFromJoin<SCHEMA, COLUMNS, JoinedTablesOutput<SCHEMA, COLUMNS> | undefined>;
    limit(count: number): SelectFromJoin<SCHEMA, COLUMNS, JoinedTablesOutput<SCHEMA, COLUMNS>[]>;
    private _orderByColumn?;
    private _orderByDirection?;
    orderBy(column: Schema.Column<SCHEMA>, order?: string): this;
    private _offset?;
    offset(amount: number): this;
    compile(): Statement.Queryable[];
    queryOne(pool: Pool | PoolClient): Promise<JoinedTablesOutput<SCHEMA, COLUMNS> | undefined>;
    protected resolveQueryOutput(output: QueryResult<any>): any;
}
export {};
