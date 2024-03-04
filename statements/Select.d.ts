import { QueryResult } from "pg";
import { MigrationTypeFromString, OutputTypeFromString } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";
type SingleStringUnion<T> = ((k: ((T extends any ? () => T : never) extends infer U ? ((U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never) extends () => (infer R) ? R : never : never)) => any) extends (k: T) => any ? T : never;
export default class SelectFromTable<SCHEMA extends TableSchema, COLUMNS extends (Schema.Column<SCHEMA> | "*")[] = Schema.Column<SCHEMA>[], RESULT = {
    [K in "*" extends COLUMNS[number] ? Schema.Column<SCHEMA> : COLUMNS[number]]: OutputTypeFromString<SCHEMA[K]>;
}[]> extends Statement<RESULT> {
    readonly tableName: string;
    readonly schema: SCHEMA;
    readonly columns: COLUMNS;
    private vars?;
    constructor(tableName: string, schema: SCHEMA, columns: COLUMNS);
    private condition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): this;
    private isPrimaryKeyed?;
    primaryKeyed(id: MigrationTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>): SelectFromTable<SCHEMA, COLUMNS, { [K in "*" extends COLUMNS[number] ? Schema.Column<SCHEMA> : COLUMNS[number]]: OutputTypeFromString<SCHEMA[K]>; } | undefined>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): any;
}
export {};
