import { Pool, PoolClient, QueryResult } from "pg";
import { Initialiser, MakeOptional, OutputTypeFromString } from "../IStrongPG";
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
export type JoinTables<TYPE extends JoinTypeName, TABLE1 extends TableSchema, TABLE2 extends TableSchema, TABLE1_NAME extends string, TABLE2_NAME extends string> = Schema.Column<TABLE1> extends infer TABLE1_COLUMNS extends string ? Schema.Column<TABLE2> extends infer TABLE2_COLUMNS extends string ? JoinColumns<TABLE1, TABLE2, TABLE1_NAME, TABLE2_NAME> extends infer COLUMNS extends string ? {
    [COLUMN in COLUMNS]: COLUMN extends TABLE1_COLUMNS ? (TYPE extends "RIGHT OUTER" | "FULL OUTER" ? MakeOptional<TABLE1[COLUMN]> : TABLE1[COLUMN]) : COLUMN extends TABLE2_COLUMNS ? (TYPE extends "LEFT OUTER" | "FULL OUTER" ? MakeOptional<TABLE2[COLUMN]> : TABLE2[COLUMN]) : COLUMN extends `${TABLE1_NAME}.${infer BASENAME extends TABLE1_COLUMNS}` ? (TYPE extends "RIGHT OUTER" | "FULL OUTER" ? MakeOptional<TABLE1[BASENAME]> : TABLE1[BASENAME]) : COLUMN extends `${TABLE2_NAME}.${infer BASENAME extends TABLE2_COLUMNS}` ? (TYPE extends "LEFT OUTER" | "FULL OUTER" ? MakeOptional<TABLE2[BASENAME]> : TABLE2[BASENAME]) : never;
} : never : never : never;
export default class Join<DATABASE extends DatabaseSchema, VIRTUAL_TABLE extends TableSchema, TYPE extends JoinTypeName> extends Statement {
    private readonly type;
    private readonly table1;
    private readonly table2;
    private readonly alias1?;
    private readonly alias2?;
    private vars;
    constructor(type: TYPE, table1: string | Join<DATABASE, any, JoinTypeName>, table2: string, alias1?: string | undefined, alias2?: string | undefined, vars?: any[]);
    private condition?;
    on(initialiser: ExpressionInitialiser<Schema.Columns<VIRTUAL_TABLE>, boolean>): this;
    innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"INNER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "INNER">;
    leftOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"LEFT OUTER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "LEFT OUTER">;
    rightOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"RIGHT OUTER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "RIGHT OUTER">;
    fullOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"FULL OUTER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "FULL OUTER">;
    /**
     * SELECT *
     */
    select(): SelectFromJoin<VIRTUAL_TABLE, ["*"]>;
    /**
     * SELECT columns AS aliases
     */
    select<COLUMNS extends Partial<Record<Schema.Column<VIRTUAL_TABLE>, string>>>(columns: COLUMNS): SelectFromJoin<VIRTUAL_TABLE, ((keyof COLUMNS) & Schema.Column<VIRTUAL_TABLE>)[], COLUMNS>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[]>(...columns: COLUMNS): SelectFromJoin<VIRTUAL_TABLE, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromJoin<VIRTUAL_TABLE, ["*"], any, any> = SelectFromJoin<VIRTUAL_TABLE, ["*"]>>(initialiser: Initialiser<SelectFromJoin<VIRTUAL_TABLE, ["*"]>, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<VIRTUAL_TABLE>[], RETURN extends SelectFromJoin<VIRTUAL_TABLE, COLUMNS, any>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromJoin<VIRTUAL_TABLE, COLUMNS>, RETURN>]): RETURN;
    private compileJoin;
    compile(): Statement.Queryable;
}
type JoinedTablesOutput<TABLE extends TableSchema, COLUMNS extends ("*" | Schema.Column<TABLE>)[], COLUMN_ALIASES extends Partial<Record<Schema.Column<TABLE>, string>> = {}> = ("*" extends COLUMNS[number] ? Schema.Column<TABLE> : Extract<COLUMNS[number], Schema.Column<TABLE>>) extends infer COLUMNS ? ({
    [COLUMN in COLUMNS as (COLUMN extends keyof COLUMN_ALIASES ? COLUMN_ALIASES[COLUMN] & string : (COLUMN extends `${string}.${infer REAL_COLUMN}` ? Extract<Exclude<COLUMNS, COLUMN>, `${string}.${REAL_COLUMN}`> extends infer OTHER_COLUMNS ? [OTHER_COLUMNS] extends [never] ? REAL_COLUMN : `strong-pg error: Unable to resolve duplicate column name: ${Extract<COLUMN | OTHER_COLUMNS, string>}` : never : COLUMN & string))]: OutputTypeFromString<TABLE[COLUMN & Schema.Column<TABLE>]>;
}) extends infer RESULT ? [
    Extract<keyof RESULT, `strong-pg error:${string}`>
] extends infer ERROR ? ERROR extends [never] ? RESULT : ERROR extends [`strong-pg error: ${infer ERROR_TEXT}`] ? ERROR_TEXT : never : never : never : never;
export declare class SelectFromJoin<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[] = (Schema.Column<SCHEMA> | "*")[], COLUMN_ALIASES extends Partial<Record<Schema.Column<SCHEMA>, string>> = {
    [COLUMN in COLUMNS[number]]: COLUMN & string;
}, RESULT = JoinedTablesOutput<SCHEMA, COLUMNS, COLUMN_ALIASES>[]> extends Statement<RESULT> {
    private readonly join;
    readonly columns: "*" | COLUMN_ALIASES;
    private vars;
    constructor(join: Join<DatabaseSchema, TableSchema, JoinTypeName>, columns: "*" | COLUMN_ALIASES);
    test: Schema.Columns<SCHEMA, COLUMN_ALIASES>;
    test2: COLUMN_ALIASES;
    test3: ("*" extends COLUMNS[number] ? Schema.Column<SCHEMA> : Extract<COLUMNS[number], Schema.Column<SCHEMA>>) extends infer COLUMNS ? COLUMNS : never;
    private condition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): this;
    private _limit?;
    limit(count: 1): SelectFromJoin<SCHEMA, COLUMNS, COLUMN_ALIASES, JoinedTablesOutput<SCHEMA, COLUMNS, COLUMN_ALIASES> | undefined>;
    limit(count: number): SelectFromJoin<SCHEMA, COLUMNS, COLUMN_ALIASES, JoinedTablesOutput<SCHEMA, COLUMNS, COLUMN_ALIASES>[]>;
    private _orderByColumn?;
    private _orderByDirection?;
    orderBy(column: Schema.Column<SCHEMA>, order?: string): this;
    private _offset?;
    offset(amount: number): this;
    compile(): Statement.Queryable[];
    queryOne(pool: Pool | PoolClient): Promise<JoinedTablesOutput<SCHEMA, COLUMNS, COLUMN_ALIASES> | undefined>;
    protected resolveQueryOutput(output: QueryResult<any>): any;
}
export {};
