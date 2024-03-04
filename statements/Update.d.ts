import { QueryResult } from "pg";
import { InputTypeFromString } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Statement from "./Statement";
export default class UpdateTable<SCHEMA extends TableSchema, RESULT = []> extends Statement<RESULT> {
    readonly tableName: string | undefined;
    readonly schema: SCHEMA;
    private vars?;
    constructor(tableName: string | undefined, schema: SCHEMA, vars?: any[]);
    private assignments;
    set(input: Partial<Schema.RowInput<SCHEMA>>): this;
    set<COLUMN_NAME extends Schema.Column<SCHEMA>>(column: COLUMN_NAME, value: InputTypeFromString<SCHEMA[COLUMN_NAME]>): this;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
