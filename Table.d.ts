import { Initialiser } from "./IStrongPG";
import Schema, { DatabaseSchema, TableSchema } from "./Schema";
import DeleteFromTable from "./statements/Delete";
import InsertIntoTable, { InsertIntoTableFactory } from "./statements/Insert";
import Join, { JoinTables } from "./statements/Join";
import SelectFromTable from "./statements/Select";
import TruncateTable from "./statements/Truncate";
import UpdateTable from "./statements/Update";
export default class Table<TABLE extends TableSchema, DATABASE extends DatabaseSchema, NAME extends DatabaseSchema.TableName<DATABASE>> {
    protected readonly name: NAME;
    protected readonly schema: TABLE;
    constructor(name: NAME, schema: TABLE);
    /**
     * SELECT *
     */
    select(): SelectFromTable<TABLE, "*"[]>;
    /**
     * SELECT columns
     */
    select<COLUMNS extends Schema.Column<TABLE>[]>(...columns: COLUMNS): SelectFromTable<TABLE, COLUMNS>;
    /**
     * SELECT *
     * ...then provide an initialiser for tweaking the query
     */
    select<RETURN extends SelectFromTable<TABLE, "*"[], any> = SelectFromTable<TABLE, "*"[]>>(initialiser: Initialiser<SelectFromTable<TABLE, "*"[]>, RETURN>): RETURN;
    /**
     * SELECT columns
     * ...then provide an initialiser for tweaking the query
     */
    select<COLUMNS extends Schema.Column<TABLE>[], RETURN extends SelectFromTable<TABLE, COLUMNS, any>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<SelectFromTable<TABLE, COLUMNS>, RETURN>]): RETURN;
    insert<COLUMNS extends Schema.Column<TABLE>[]>(...columns: COLUMNS): InsertIntoTableFactory<TABLE, COLUMNS>;
    insert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, COLUMNS> | InsertIntoTable<TABLE>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, COLUMNS>, RETURN>]): RETURN;
    insert(data: Partial<Schema.RowInput<TABLE>>): InsertIntoTable<TABLE>;
    insert(data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<InsertIntoTable<TABLE>>): InsertIntoTable<TABLE>;
    upsert(data: Schema.RowInput<TABLE>): InsertIntoTable<TABLE>;
    upsert<RETURN extends InsertIntoTable<TABLE, any>>(data: Schema.RowInput<TABLE>, initialiser: Initialiser<InsertIntoTable<TABLE>, RETURN>): RETURN;
    upsert<COLUMNS extends Schema.Column<TABLE>[]>(...columns: COLUMNS): InsertIntoTableFactory<TABLE, COLUMNS>;
    upsert<COLUMNS extends Schema.Column<TABLE>[], RETURN extends InsertIntoTableFactory<TABLE, COLUMNS> | InsertIntoTable<TABLE>>(...columnsAndInitialiser: [...COLUMNS, Initialiser<InsertIntoTableFactory<TABLE, COLUMNS>, RETURN>]): RETURN;
    update(data: Partial<Schema.RowInput<TABLE>>): UpdateTable<TABLE>;
    update<RETURN extends UpdateTable<TABLE, any>>(data: Partial<Schema.RowInput<TABLE>>, initialiser: Initialiser<UpdateTable<TABLE>, RETURN>): RETURN;
    delete(): DeleteFromTable<TABLE>;
    delete<RETURN extends DeleteFromTable<TABLE, any> = DeleteFromTable<TABLE>>(initialiser: Initialiser<DeleteFromTable<TABLE>, RETURN>): RETURN;
    truncate(): TruncateTable;
    as<TABLE1_ALIAS extends string>(alias1: TABLE1_ALIAS): {
        innerJoin: <TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias2?: TABLE2_ALIAS | undefined) => Join<DATABASE, JoinTables<"INNER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, TABLE1_ALIAS, TABLE2_ALIAS>, "INNER">;
        leftOuterJoin: <TABLE2_NAME_1 extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS_1 extends string = TABLE2_NAME_1>(tableName: TABLE2_NAME_1, alias2?: TABLE2_ALIAS_1 | undefined) => Join<DATABASE, JoinTables<"LEFT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME_1>, TABLE1_ALIAS, TABLE2_ALIAS_1>, "LEFT OUTER">;
        rightOuterJoin: <TABLE2_NAME_2 extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS_2 extends string = TABLE2_NAME_2>(tableName: TABLE2_NAME_2, alias2?: TABLE2_ALIAS_2 | undefined) => Join<DATABASE, JoinTables<"RIGHT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME_2>, TABLE1_ALIAS, TABLE2_ALIAS_2>, "RIGHT OUTER">;
        fullOuterJoin: <TABLE2_NAME_3 extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS_3 extends string = TABLE2_NAME_3>(tableName: TABLE2_NAME_3, alias2?: TABLE2_ALIAS_3 | undefined) => Join<DATABASE, JoinTables<"FULL OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME_3>, TABLE1_ALIAS, TABLE2_ALIAS_3>, "FULL OUTER">;
    };
    innerJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"INNER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "INNER">;
    leftOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"LEFT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "LEFT OUTER">;
    rightOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"RIGHT OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "RIGHT OUTER">;
    fullOuterJoin<TABLE2_NAME extends DatabaseSchema.TableName<DATABASE>, TABLE2_ALIAS extends string = TABLE2_NAME>(tableName: TABLE2_NAME, alias?: TABLE2_ALIAS): Join<DATABASE, JoinTables<"FULL OUTER", TABLE, DatabaseSchema.Table<DATABASE, TABLE2_NAME>, NAME, TABLE2_ALIAS>, "FULL OUTER">;
}
