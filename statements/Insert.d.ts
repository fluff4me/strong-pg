import { QueryResult } from "pg";
import { Initialiser, InputTypeFromString, OutputTypeFromString, Value } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Statement from "./Statement";
import UpdateTable from "./Update";
export interface InsertIntoTableFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> {
    prepare(): InsertIntoTable<SCHEMA, COLUMNS>;
    values(...values: {
        [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]>;
    }): InsertIntoTable<SCHEMA, COLUMNS>;
}
export interface InsertIntoTableConflictActionFactory<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> {
    doNothing(): InsertIntoTable<SCHEMA, COLUMNS, RESULT>;
    doUpdate(initialiser: Initialiser<UpdateTable<SCHEMA, any, {
        [KEY in COLUMNS[number] as `EXCLUDED.${KEY & string}`]: SCHEMA[KEY];
    }>>): InsertIntoTable<SCHEMA, COLUMNS, RESULT>;
}
export default class InsertIntoTable<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> extends Statement<RESULT> {
    readonly tableName: string;
    readonly schema: SCHEMA;
    readonly columns: Schema.Column<SCHEMA>[];
    readonly rows: Value<Schema.RowInput<SCHEMA>>[][];
    static columns<SCHEMA extends TableSchema, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]>(tableName: string, schema: SCHEMA, columns: COLUMNS, isUpsert?: boolean): InsertIntoTableFactory<SCHEMA, COLUMNS>;
    private vars;
    constructor(tableName: string, schema: SCHEMA, columns: Schema.Column<SCHEMA>[], rows: Value<Schema.RowInput<SCHEMA>>[][]);
    values(...values: {
        [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]>;
    }): this;
    private conflictTarget?;
    private conflictAction?;
    onConflict(...columns: Schema.Column<SCHEMA>[]): InsertIntoTableConflictActionFactory<SCHEMA, COLUMNS, RESULT>;
    private returningColumns?;
    returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: RETURNING_COLUMNS): InsertIntoTable<SCHEMA, COLUMNS, {
        [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]>;
    }[]>;
    returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | "*">(columns: RETURNING_COLUMN): InsertIntoTable<SCHEMA, COLUMNS, {
        [KEY in RETURNING_COLUMN extends "*" ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]>;
    }[]>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
