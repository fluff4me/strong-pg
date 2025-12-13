import type { QueryResult } from 'pg';
import type { InputTypeFromString, OutputTypeFromString, SingleStringUnion } from '../IStrongPG';
import type { TableSchema } from '../Schema';
import Schema from '../Schema';
import type { ExpressionInitialiser } from '../expressions/Expression';
import Statement from './Statement';
export default class DeleteFromTable<SCHEMA extends TableSchema, RESULT = []> extends Statement<RESULT> {
    readonly tableName: string | undefined;
    readonly schema: SCHEMA;
    private vars;
    constructor(tableName: string | undefined, schema: SCHEMA);
    private condition?;
    where(initialiser: ExpressionInitialiser<Schema.Columns<SCHEMA>, boolean>): this;
    primaryKeyed(id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>): this;
    private returningColumns?;
    returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: RETURNING_COLUMNS): DeleteFromTable<SCHEMA, {
        [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]>;
    }[]>;
    returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | '*'>(columns: RETURNING_COLUMN): DeleteFromTable<SCHEMA, {
        [KEY in RETURNING_COLUMN extends '*' ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]>;
    }[]>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
