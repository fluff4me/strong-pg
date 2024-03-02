import { QueryResult } from "pg";
import { TypeFromString } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";
type SingleStringUnion<T> = ((k: ((T extends any ? () => T : never) extends infer U ? ((U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never) extends () => (infer R) ? R : never : never)) => any) extends (k: T) => any ? T : never;
export default class SelectFromTable<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> extends Statement<{
    [K in COLUMNS[number]]: TypeFromString<SCHEMA[K]>;
}[]> {
    readonly tableName: string;
    readonly schema: SCHEMA;
    readonly columns: COLUMNS;
    private vars?;
    constructor(tableName: string, schema: SCHEMA, columns: COLUMNS);
    private condition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): this;
    private isPrimaryKeyed?;
    primaryKeyed(id: TypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>): Statement<{ [K in COLUMNS[number]]: TypeFromString<SCHEMA[K]>; } | undefined>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): any;
}
export {};
