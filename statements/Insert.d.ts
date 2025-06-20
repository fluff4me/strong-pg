import { QueryResult } from "pg";
import { Initialiser, InputTypeFromString, OutputTypeFromString, Value } from "../IStrongPG";
import Schema, { TableSchema } from "../Schema";
import Statement from "./Statement";
import UpdateTable from "./Update";
export interface InsertIntoTableFactory<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]> {
    prepare(): InsertIntoTable<SCHEMA, NAME, COLUMNS>;
    values(...values: {
        [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]>;
    }): InsertIntoTable<SCHEMA, NAME, COLUMNS>;
}
export interface InsertIntoTableConflictActionFactory<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> {
    doNothing(): InsertIntoTable<SCHEMA, NAME, COLUMNS, RESULT>;
    doUpdate(initialiser: Initialiser<UpdateTable<NAME, SCHEMA, any, {
        [KEY in COLUMNS[number] as `EXCLUDED.${KEY & string}`]: SCHEMA[KEY];
    } & {
        [KEY in COLUMNS[number] as `${NAME}.${KEY & string}`]: SCHEMA[KEY];
    }>>): InsertIntoTable<SCHEMA, NAME, COLUMNS, RESULT>;
}
export default class InsertIntoTable<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[], RESULT = []> extends Statement<RESULT> {
    readonly tableName: NAME;
    readonly schema: SCHEMA;
    readonly columns: Schema.Column<SCHEMA>[];
    readonly rows: Value<Schema.RowInput<SCHEMA>>[][];
    static columns<SCHEMA extends TableSchema, NAME extends string, COLUMNS extends Schema.Column<SCHEMA>[] = Schema.Column<SCHEMA>[]>(tableName: NAME, schema: SCHEMA, columns: COLUMNS, isUpsert?: boolean): InsertIntoTableFactory<SCHEMA, NAME, COLUMNS>;
    private vars;
    constructor(tableName: NAME, schema: SCHEMA, columns: Schema.Column<SCHEMA>[], rows: Value<Schema.RowInput<SCHEMA>>[][]);
    values(...values: {
        [I in keyof COLUMNS]: InputTypeFromString<SCHEMA[COLUMNS[I]]>;
    }): this;
    private conflictTarget?;
    private conflictAction?;
    onConflict(...columns: Schema.Column<SCHEMA>[]): InsertIntoTableConflictActionFactory<SCHEMA, NAME, COLUMNS, RESULT>;
    private returningColumns?;
    returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: RETURNING_COLUMNS): InsertIntoTable<SCHEMA, NAME, COLUMNS, {
        [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]>;
    }[]>;
    returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | "*">(columns: RETURNING_COLUMN): InsertIntoTable<SCHEMA, NAME, COLUMNS, {
        [KEY in RETURNING_COLUMN extends "*" ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]>;
    }[]>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
