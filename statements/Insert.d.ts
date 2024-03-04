import { QueryResult } from "pg";
import { Initialiser, InputTypeFromString, Value } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Statement from "./Statement";
import UpdateTable from "./Update";
export interface InsertIntoTableFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> {
    values(...values: {
        [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]>;
    }): InsertIntoTable<SCHEMA, COLUMNS>;
}
export default class InsertIntoTable<SCHEMA extends TableSchema, RESULT = []> extends Statement<RESULT> {
    readonly tableName: string;
    readonly schema: SCHEMA;
    readonly columns: Schema.Column<SCHEMA>[];
    readonly values: Value<Schema.RowInput<SCHEMA>>[];
    static columns<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]>(tableName: string, schema: SCHEMA, columns: COLUMNS, isUpsert?: boolean): InsertIntoTableFactory<SCHEMA, COLUMNS>;
    private vars;
    constructor(tableName: string, schema: SCHEMA, columns: Schema.Column<SCHEMA>[], values: Value<Schema.RowInput<SCHEMA>>[]);
    private onConflict?;
    onConflictDoNothing(): this;
    onConflictDoUpdate(initialiser: Initialiser<UpdateTable<SCHEMA, any>>): this;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
