import { Initialiser } from "./IStrongPG";
import Schema, { TableSchema } from "./Schema";
import SelectFromTable from "./statements/Select";
export default class Table<SCHEMA extends TableSchema> {
    protected readonly name: string;
    protected readonly schema: SCHEMA;
    constructor(name: string, schema: SCHEMA);
    select<COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: COLUMNS): SelectFromTable<SCHEMA, COLUMNS>;
    select<COLUMNS extends Schema.Column<SCHEMA>[]>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<SCHEMA, COLUMNS>>]): SelectFromTable<SCHEMA, COLUMNS>;
}
