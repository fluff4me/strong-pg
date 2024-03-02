import { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser, TypeFromString, TypeString } from "../../IStrongPG";
import Schema, { DatabaseSchema } from "../../Schema";
import Statement from "../Statement";
export type AlterTableInitialiser<DB extends DatabaseSchema, SCHEMA_START, SCHEMA_END> = Initialiser<AlterTable<DB, SCHEMA_START>, AlterTable<DB, SCHEMA_START, SCHEMA_END>>;
export default class AlterTable<DB extends DatabaseSchema, SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<Statement> {
    readonly table: string;
    protected readonly schemaStart: SCHEMA_START;
    protected readonly schemaEnd: SCHEMA_END;
    constructor(table: string);
    private do;
    private doStandalone;
    addColumn<NAME extends string, TYPE extends TypeString>(name: NAME, type: TYPE, initialiser?: Initialiser<CreateColumn<DB, TYPE>>): AlterTable<DB, SCHEMA_START, { [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string>(name: NAME): AlterTable<DB, SCHEMA_START, Omit<SCHEMA_END, NAME>>;
    renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string>(name: NAME, newName: NAME_NEW): AlterTable<DB, SCHEMA_START, { [KEY in NAME_NEW | Exclude<keyof SCHEMA_END, NAME>]: KEY extends NAME_NEW ? SCHEMA_END[NAME] : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]>(...keys: KEYS): AlterTable<DB, SCHEMA_START, Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>;
    dropPrimaryKey(): AlterTable<DB, SCHEMA_START, Schema.DropPrimaryKey<SCHEMA_END>>;
    check(id: string, value: ExpressionInitialiser<Schema.Columns<SCHEMA_END>, boolean>): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    foreignKey<COLUMN extends Schema.Column<SCHEMA_END>, FOREIGN_TABLE extends DatabaseSchema.TableName<DB>, FOREIGN_KEY extends Schema.ColumnTyped<DatabaseSchema.Table<DB, FOREIGN_TABLE>, SCHEMA_END[COLUMN]>>(column: COLUMN, foreignTable: FOREIGN_TABLE, foreignKey: FOREIGN_KEY): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    unique(name: string, index: DatabaseSchema.IndexName<DB>): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    schema<SCHEMA_TEST extends SCHEMA_END>(): SCHEMA_END extends SCHEMA_TEST ? AlterTable<DB, SCHEMA_START, SCHEMA_TEST> : null;
    protected compileOperation(operation: string): string;
}
export declare class CreateColumn<DB extends DatabaseSchema, TYPE extends TypeString> extends Statement.Super<CreateColumnSubStatement> {
    default(value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>): this;
    notNull(): this;
    collate(collation: DatabaseSchema.CollationName<DB>): number;
    protected compileOperation(operation: string): string;
}
declare class CreateColumnSubStatement extends Statement {
    private readonly compiled;
    private readonly vars?;
    /**
     * Warning: Do not use this outside of migrations
     */
    static setDefault<TYPE extends TypeString>(value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>): CreateColumnSubStatement;
    static setNotNull(): CreateColumnSubStatement;
    static setCollation(collation: string): CreateColumnSubStatement;
    private constructor();
    compile(): Statement.Queryable[];
}
export declare class AlterColumn<NAME extends string, TYPE extends TypeString> extends Statement.Super<AlterColumnSubStatement> {
    name: NAME;
    constructor(name: NAME);
    default(value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>): this;
    notNull(): this;
    protected compileOperation(operation: string): string;
}
declare class AlterColumnSubStatement extends Statement {
    private readonly compiled;
    private readonly vars?;
    /**
     * Warning: Do not use this outside of migrations
     */
    static setDefault<TYPE extends TypeString>(value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>): AlterColumnSubStatement;
    static setNotNull(): AlterColumnSubStatement;
    private constructor();
    compile(): Statement.Queryable[];
}
export {};
