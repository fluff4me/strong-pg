import { Initialiser } from "./IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "./Schema";
import DeleteFromTable from "./statements/Delete";
import InsertIntoTable, { InsertIntoTableFactory } from "./statements/Insert";
import Join, { JoinTables } from "./statements/Join";
import Recursive from "./statements/Recursive";
import SelectFromTable, { SelectColumnsRecord } from "./statements/Select";
import TruncateTable from "./statements/Truncate";
import UpdateTable from "./statements/Update";
export default class Table<TABLE extends TableSchema, DATABASE extends DatabaseSchema, NAME extends DatabaseSchema.TableName<DATABASE>> {
    protected readonly name: NAME;
    protected readonly schema: TABLE;
    constructor(name: NAME, schema: TABLE);
    /**
     * SELECT 1
     */
    select(): SelectFromTable<TABLE, NAME, 1>;
    /**
     * SELECT *
     */
    select(column: "*"): SelectFromTable<TABLE, NAME, "*">;
    /**
     * SELECT columns AS aliases
     */
    select<const COLUMNS extends SelectColumnsRecord<TABLE, NAME>>(columns: COLUMNS): SelectFromTable<TABLE, NAME, COLUMNS>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<TABLE>[]>(...columns: COLUMNS): SelectFromTable<TABLE, NAME, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromTable<TABLE, "*"> = SelectFromTable<TABLE, "*">>(column: "*", initialiser: Initialiser<SelectFromTable<TABLE, "*">, RETURN>): RETURN;
    /**
     * SELECT 1
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromTable<TABLE, NAME, 1> = SelectFromTable<TABLE, NAME, 1>>(initialiser: Initialiser<SelectFromTable<TABLE, NAME, 1>, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<TABLE>[], RETURN extends SelectFromTable<TABLE, NAME, COLUMNS>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
    insert<COLUMNS extends Schema.Column<TABLE>[]>(...columns: COLUMNS): InsertIntoTableFactory<TABLE, NAME, COLUMNS>;
    insert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, NAME, COLUMNS> | InsertIntoTable<TABLE, NAME>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
    insert(data: Partial<Schema.RowInput<TABLE>>): InsertIntoTable<TABLE, NAME>;
    insert(data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<InsertIntoTable<TABLE, NAME>>): InsertIntoTable<TABLE, NAME>;
    upsert(data: Schema.RowInput<TABLE>): InsertIntoTable<TABLE, NAME>;
    upsert<RETURN extends InsertIntoTable<TABLE, any>>(data: Schema.RowInput<TABLE>, initialiser: Initialiser<InsertIntoTable<TABLE, NAME>, RETURN>): RETURN;
    upsert<COLUMNS extends Schema.Column<TABLE>[]>(...columns: COLUMNS): InsertIntoTableFactory<TABLE, NAME, COLUMNS>;
    upsert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, NAME, COLUMNS> | InsertIntoTable<TABLE, NAME>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, NAME, COLUMNS>, RETURN>]): RETURN;
    update(): UpdateTable<NAME, TABLE>;
    update(data: Partial<Schema.RowInput<TABLE>>): UpdateTable<NAME, TABLE>;
    update<RETURN extends UpdateTable<NAME, TABLE, any>>(data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<UpdateTable<NAME, TABLE>, RETURN>): RETURN;
    delete(): DeleteFromTable<TABLE>;
    delete<RETURN extends DeleteFromTable<TABLE, any> = DeleteFromTable<TABLE>>(initialiser: Initialiser<DeleteFromTable<TABLE>, RETURN>): RETURN;
    truncate(): TruncateTable;
    as<TABLE1_ALIAS extends string>(alias1: TABLE1_ALIAS): {
        innerJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS) => Join<DATABASE, JoinTables<"INNER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "INNER">;
        leftOuterJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS) => Join<DATABASE, JoinTables<"LEFT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "LEFT OUTER">;
        rightOuterJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS) => Join<DATABASE, JoinTables<"RIGHT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "RIGHT OUTER">;
        fullOuterJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS) => Join<DATABASE, JoinTables<"FULL OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "FULL OUTER">;
    };
    innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"INNER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "INNER">;
    leftOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"LEFT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "LEFT OUTER">;
    rightOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"RIGHT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "RIGHT OUTER">;
    fullOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"FULL OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "FULL OUTER">;
    recursive<COLUMNS extends Schema.Column<TABLE>[]>(columns: COLUMNS, initialiser: (query: Recursive<TABLE, Pick<TABLE, COLUMNS[number]>, NAME>) => any): Recursive<TABLE, Pick<TABLE, COLUMNS[number]>, NAME>;
}
