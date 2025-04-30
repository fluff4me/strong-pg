import { QueryResult } from "pg";
import { InputTypeFromString, OutputTypeFromString, SingleStringUnion } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import { ExpressionInitialiser } from "../expressions/Expression";
import Statement from "./Statement";
export default class UpdateTable<SCHEMA extends TableSchema, RESULT = number, VARS = {}> extends Statement<RESULT> {
    readonly tableName: string | undefined;
    readonly schema: SCHEMA;
    private vars;
    constructor(tableName: string | undefined, schema: SCHEMA, vars?: any[]);
    private assignments;
    set(input: Partial<Schema.RowInput<SCHEMA, VARS & Schema.Columns<SCHEMA>>>): this;
    set<COLUMN_NAME extends Schema.Column<SCHEMA>>(column: COLUMN_NAME, value: InputTypeFromString<SCHEMA[COLUMN_NAME], VARS & Schema.Columns<SCHEMA>>): this;
    private condition?;
    where(initialiser: ExpressionInitialiser<VARS & Schema.Columns<SCHEMA>, boolean>): this;
    primaryKeyed(id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>): this;
    private returningColumns?;
    returning(): UpdateTable<SCHEMA, number, VARS>;
    returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: RETURNING_COLUMNS): UpdateTable<SCHEMA, {
        [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]>;
    }[], VARS>;
    returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | "*">(columns: RETURNING_COLUMN): UpdateTable<SCHEMA, {
        [KEY in RETURNING_COLUMN extends "*" ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]>;
    }[], VARS>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
