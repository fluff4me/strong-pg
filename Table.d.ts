import { Initialiser } from "./IStrongPG";
import Schema, { TableSchema } from "./Schema";
import DeleteFromTable from "./statements/Delete";
import InsertIntoTable, { InsertIntoTableFactory } from "./statements/Insert";
import SelectFromTable from "./statements/Select";
import TruncateTable from "./statements/Truncate";
import UpdateTable from "./statements/Update";
export default class Table<SCHEMA extends TableSchema> {
    protected readonly name: string;
    protected readonly schema: SCHEMA;
    constructor(name: string, schema: SCHEMA);
    /**
     * SELECT *
     */
    select(): SelectFromTable<SCHEMA, "*"[]>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: COLUMNS): SelectFromTable<SCHEMA, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromTable<SCHEMA, "*"[], any> = SelectFromTable<SCHEMA, "*"[]>>(initialiser: Initialiser<SelectFromTable<SCHEMA, "*"[]>, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<SCHEMA>[], RETURN extends SelectFromTable<SCHEMA, COLUMNS, any>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<SCHEMA, COLUMNS>, RETURN>]): RETURN;
    insert<COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: COLUMNS): InsertIntoTableFactory<SCHEMA, COLUMNS>;
    insert<COLUMNS extends Schema.Column<SCHEMA>[], RETURN extends InsertIntoTableFactory<SCHEMA, COLUMNS> | InsertIntoTable<SCHEMA>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<SCHEMA, COLUMNS>, RETURN>]): RETURN;
    insert(data: Partial<Schema.RowInput<SCHEMA>>): InsertIntoTable<SCHEMA>;
    insert(data: Partial<Schema.RowInput<SCHEMA>>, initialiser: Initialiser<InsertIntoTable<SCHEMA>>): InsertIntoTable<SCHEMA>;
    upsert(data: Schema.RowInput<SCHEMA>): InsertIntoTable<SCHEMA>;
    upsert<RETURN extends InsertIntoTable<SCHEMA, any>>(data: Schema.RowInput<SCHEMA>, initialiser: Initialiser<InsertIntoTable<SCHEMA>, RETURN>): RETURN;
    upsert<COLUMNS extends Schema.Column<SCHEMA>[]>(...columns: COLUMNS): InsertIntoTableFactory<SCHEMA, COLUMNS>;
    upsert<COLUMNS extends Schema.Column<SCHEMA>[], RETURN extends InsertIntoTableFactory<SCHEMA, COLUMNS> | InsertIntoTable<SCHEMA>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<SCHEMA, COLUMNS>, RETURN>]): RETURN;
    update(data: Partial<Schema.RowInput<SCHEMA>>): UpdateTable<SCHEMA>;
    update<RETURN extends UpdateTable<SCHEMA, any>>(data: Partial<Schema.RowInput<SCHEMA>>, initialiser: Initialiser<UpdateTable<SCHEMA>, RETURN>): RETURN;
    delete(): DeleteFromTable<SCHEMA>;
    delete<RETURN extends DeleteFromTable<SCHEMA, any> = DeleteFromTable<SCHEMA>>(initialiser: Initialiser<DeleteFromTable<SCHEMA>, RETURN>): RETURN;
    truncate(): TruncateTable;
}
