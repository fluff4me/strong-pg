import { Initialiser, Merge2, TypeString } from "../../IStrongPG";
import { Schema } from "../../Schema";
import Transaction from "../../Transaction";
export declare namespace TableMigration {
    type Operation = string;
    namespace Operation {
        type ColumnAdd<COLUMN extends string, TYPE extends TypeString> = `ADD COLUMN ${COLUMN} ${TYPE}`;
        type ColumnRemove<COLUMN extends string> = `DROP COLUMN ${COLUMN}`;
        type ColumnRename<COLUMN extends string, NAME_NEW extends string> = `RENAME COLUMN ${COLUMN} TO ${NAME_NEW}`;
        type AddPrimaryKey = `ADD CONSTRAINT table_pkey PRIMARY KEY (${string})`;
        type DropPrimaryKey = "DROP CONSTRAINT table_pkey";
    }
}
export default class AlterTable<SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : Exclude<SCHEMA_START, null>> extends Transaction {
    readonly table: string;
    private schemaStart;
    private schemaEnd;
    constructor(table: string);
    readonly operations: TableMigration.Operation[];
    readonly standaloneOperations: TableMigration.Operation[];
    private do;
    private doStandalone;
    addColumn<NAME extends string, TYPE extends TypeString>(name: NAME, type: TYPE, initialiser?: Initialiser<ColumnAddition<NAME, TYPE>>): AlterTable<SCHEMA_START, Merge2<SCHEMA_END, { [KEY in NAME]: TYPE; }>>;
    dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string>(name: NAME): AlterTable<SCHEMA_START, Pick<SCHEMA_END, Exclude<keyof SCHEMA_END, NAME>>>;
    renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string>(name: NAME, newName: NAME_NEW): AlterTable<SCHEMA_START, Merge2<Pick<SCHEMA_END, Exclude<keyof SCHEMA_END, NAME>>, { [KEY in NAME_NEW]: SCHEMA_END[NAME]; }>>;
    addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]>(...keys: KEYS): AlterTable<SCHEMA_START, Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>;
    dropPrimaryKey(): AlterTable<SCHEMA_START, Schema.DropPrimaryKey<SCHEMA_END>>;
    renameTo(newName: string): this;
    schema<SCHEMA_TEST extends SCHEMA_END>(): SCHEMA_END extends SCHEMA_TEST ? AlterTable<SCHEMA_START, SCHEMA_TEST> : null;
    compile(): string[];
}
export declare class ColumnReference<TYPE extends TypeString> {
    readonly table: string;
    readonly column: string;
    constructor(table: string, column: string);
}
export declare class ColumnAddition<NAME extends string, TYPE extends TypeString> {
    name: NAME;
    type: TYPE;
    constructor(name: NAME, type: TYPE);
    reference?: ColumnReference<TYPE>;
    setReferences(reference: ColumnReference<TYPE>): this;
}
