import { MakeOptional } from "../IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "../Schema";
import { VirtualTable } from "../VirtualTable";
import { ExpressionInitialiser } from "../expressions/Expression";
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
export default class Join<DATABASE extends DatabaseSchema, VIRTUAL_TABLE extends TableSchema, TYPE extends JoinTypeName> extends VirtualTable<VIRTUAL_TABLE> {
    private readonly type;
    private readonly table1;
    private readonly table2;
    private readonly alias1?;
    private readonly alias2?;
    constructor(type: TYPE, table1: string | Join<DATABASE, any, JoinTypeName>, table2: string, alias1?: string | undefined, alias2?: string | undefined, vars?: any[]);
    private condition?;
    on(initialiser: ExpressionInitialiser<Schema.Columns<VIRTUAL_TABLE>, boolean>): this;
    innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"INNER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "INNER">;
    leftOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"LEFT OUTER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "LEFT OUTER">;
    rightOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"RIGHT OUTER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "RIGHT OUTER">;
    fullOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"FULL OUTER", VIRTUAL_TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, "", TABLE2_ALIAS>, "FULL OUTER">;
    compileFrom(): string;
}
export {};
