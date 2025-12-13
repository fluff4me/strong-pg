import type { QueryResult } from 'pg';
import type { InputTypeFromString, OutputTypeFromString, SingleStringUnion, TypeString } from '../IStrongPG';
import type { TableSchema } from '../Schema';
import Schema from '../Schema';
import type { ExpressionInitialiser } from '../expressions/Expression';
import Statement from './Statement';
import Values from './Values';
export default class UpdateTable<NAME extends string, SCHEMA extends TableSchema, RESULT = number, VARS = {}> extends Statement<RESULT> {
    readonly tableName: NAME;
    readonly schema: SCHEMA;
    private vars;
    constructor(tableName: NAME, schema: SCHEMA, vars?: any[]);
    private fromExpr?;
    from<VT_NAME extends string, const COLUMNS extends readonly string[], TYPES extends readonly TypeString[]>(name: VT_NAME, columns: COLUMNS, initialiser: (values: Values<NoInfer<VT_NAME>, NoInfer<COLUMNS>>) => Values<NoInfer<VT_NAME>, NoInfer<COLUMNS>, TYPES>): UpdateTable<NAME, SCHEMA, RESULT, VARS & { [COLUMN in COLUMNS[number] as `${VT_NAME}.${COLUMN}`]: { [INDEX in keyof COLUMNS as COLUMN extends COLUMNS[INDEX] ? INDEX : never]: InputTypeFromString<TYPES[INDEX & keyof TYPES] & TypeString, VARS>; }; }>;
    private assignments;
    set(input: Partial<Schema.RowInput<SCHEMA, VARS & Schema.Columns<SCHEMA>>>): this;
    set<COLUMN_NAME extends Schema.Column<SCHEMA>>(column: COLUMN_NAME, value: InputTypeFromString<SCHEMA[COLUMN_NAME], VARS & Schema.Columns<SCHEMA>>): this;
    private condition?;
    where(initialiser: ExpressionInitialiser<VARS & Schema.Columns<SCHEMA> & Schema.TableColumns<NAME, SCHEMA>, boolean>): this;
    primaryKeyed(id: InputTypeFromString<SCHEMA[SingleStringUnion<Schema.PrimaryKey<SCHEMA>[number]>]>): this;
    private returningColumns?;
    returning(): UpdateTable<NAME, SCHEMA, number, VARS>;
    returning<RETURNING_COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: RETURNING_COLUMNS): UpdateTable<NAME, SCHEMA, {
        [KEY in RETURNING_COLUMNS[number]]: OutputTypeFromString<SCHEMA[KEY]>;
    }[], VARS>;
    returning<RETURNING_COLUMN extends Schema.Column<SCHEMA> | '*'>(columns: RETURNING_COLUMN): UpdateTable<NAME, SCHEMA, {
        [KEY in RETURNING_COLUMN extends '*' ? Schema.Column<SCHEMA> : RETURNING_COLUMN]: OutputTypeFromString<SCHEMA[KEY]>;
    }[], VARS>;
    compile(): Statement.Queryable[];
    protected resolveQueryOutput(output: QueryResult<any>): RESULT;
}
