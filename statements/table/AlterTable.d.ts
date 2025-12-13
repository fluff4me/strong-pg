import type { ExpressionInitialiser, ExpressionOr } from '../../expressions/Expression';
import type { ExtractTypeString, ForeignKeyOnDeleteAction, Initialiser, MigrationTypeFromString, OptionalTypeString } from '../../IStrongPG';
import { TypeString } from '../../IStrongPG';
import type Schema from '../../Schema';
import type { DatabaseSchema } from '../../Schema';
import Statement from '../Statement';
export type AlterTableInitialiser<DB extends DatabaseSchema, SCHEMA_START, SCHEMA_END> = Initialiser<AlterTable<DB, SCHEMA_START>, AlterTable<DB, SCHEMA_START, SCHEMA_END>>;
export default class AlterTable<DB extends DatabaseSchema, SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<Statement> {
    readonly table: string;
    protected readonly schemaStart: SCHEMA_START;
    protected readonly schemaEnd: SCHEMA_END;
    constructor(table: string);
    private do;
    private declare;
    private doStandalone;
    addColumn<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString = OptionalTypeString<TYPE>>(name: NAME, type: TYPE, initialiser?: Initialiser<CreateColumn<DB, OptionalTypeString<TYPE>>, CreateColumn<DB, NEW_TYPE>>): AlterTable<DB, SCHEMA_START, { [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    declareColumn<NAME extends string, TYPE extends TypeString>(name: NAME, type: TYPE): AlterTable<DB, SCHEMA_START, { [KEY in keyof SCHEMA_END | NAME]: KEY extends NAME ? TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    alterColumn<NAME extends keyof SCHEMA_END & string, NEW_TYPE extends TypeString | OptionalTypeString>(name: NAME, initialiser: Initialiser<AlterColumn<NAME, SCHEMA_END[NAME] & (TypeString | OptionalTypeString)>, AlterColumn<NAME, NEW_TYPE>>): AlterTable<DB, SCHEMA_START, { [KEY in keyof SCHEMA_END | NAME]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string>(name: NAME): AlterTable<DB, SCHEMA_START, Omit<SCHEMA_END, NAME>>;
    renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string>(name: NAME, newName: NAME_NEW): AlterTable<DB, SCHEMA_START, { [KEY in NAME_NEW | Exclude<keyof SCHEMA_END, NAME>]: KEY extends NAME_NEW ? SCHEMA_END[NAME] : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]>(...keys: KEYS): AlterTable<DB, SCHEMA_START, Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>;
    dropPrimaryKey(): AlterTable<DB, SCHEMA_START, Schema.DropPrimaryKey<SCHEMA_END>>;
    check(id: string, value: ExpressionInitialiser<Schema.Columns<SCHEMA_END>, boolean>): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    foreignKey<COLUMN extends Schema.Column<SCHEMA_END>, FOREIGN_TABLE extends DatabaseSchema.TableName<DB>, FOREIGN_KEY extends Schema.ColumnTyped<DatabaseSchema.Table<DB, FOREIGN_TABLE>, SCHEMA_END[COLUMN]>>(column: COLUMN, foreignTable: FOREIGN_TABLE, foreignKey: FOREIGN_KEY, onDelete?: ForeignKeyOnDeleteAction, onUpdate?: ForeignKeyOnDeleteAction): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    dropForeignKey<COLUMN extends Schema.Column<SCHEMA_END>>(column: COLUMN): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    dropConstraint(constraint_name: DatabaseSchema.IndexName<DB>): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    unique(name: string, index: DatabaseSchema.IndexName<DB>): AlterTable<DB, SCHEMA_START, SCHEMA_END>;
    schema<SCHEMA_TEST extends SCHEMA_END>(): SCHEMA_END extends SCHEMA_TEST ? AlterTable<DB, SCHEMA_START, SCHEMA_TEST> : null;
    protected compileOperation(operation: string): string;
}
export declare class CreateColumn<DB extends DatabaseSchema, TYPE extends TypeString | OptionalTypeString> extends Statement.Super<CreateColumnSubStatement> {
    default(value: ExpressionOr<{}, MigrationTypeFromString<TYPE>>): this;
    notNull(): CreateColumn<DB, ExtractTypeString<TYPE>>;
    collate(collation: DatabaseSchema.CollationName<DB>): this;
    protected compileOperation(operation: string): string;
}
declare class CreateColumnSubStatement extends Statement {
    private readonly compiled;
    private readonly vars?;
    /**
     * Warning: Do not use this outside of migrations
     */
    static setDefault<TYPE extends TypeString | OptionalTypeString>(value: ExpressionOr<{}, MigrationTypeFromString<TYPE>>): CreateColumnSubStatement;
    static setNotNull(): CreateColumnSubStatement;
    static setCollation(collation: string): CreateColumnSubStatement;
    private constructor();
    compile(): Statement.Queryable[];
}
export declare class AlterColumn<NAME extends string, TYPE extends TypeString | OptionalTypeString> extends Statement.Super<AlterColumnSubStatement | AlterColumnSetType<TypeString>> {
    name: NAME;
    constructor(name: NAME);
    setType<TYPE extends TypeString>(type: TYPE, initialiser?: Initialiser<AlterColumnSetType<TYPE>>): AlterColumn<NAME, TYPE>;
    setDefault(value: MigrationTypeFromString<TYPE> | ExpressionInitialiser<{}, MigrationTypeFromString<TYPE>>): this;
    dropDefault(): this;
    setNotNull(): AlterColumn<NAME, ExtractTypeString<TYPE>>;
    dropNotNull(): AlterColumn<NAME, TYPE extends TypeString ? OptionalTypeString<TYPE> : TYPE>;
    protected compileOperation(operation: string): string;
}
declare class AlterColumnSubStatement extends Statement {
    private readonly compiled;
    private readonly vars?;
    /**
     * Warning: Do not use this outside of migrations
     */
    static setDefault<TYPE extends TypeString>(value: MigrationTypeFromString<TYPE | OptionalTypeString<TYPE>> | ExpressionInitialiser<{}, MigrationTypeFromString<TYPE | OptionalTypeString<TYPE>>>): AlterColumnSubStatement;
    static dropDefault(): AlterColumnSubStatement;
    static setNotNull(): AlterColumnSubStatement;
    static dropNotNull(): AlterColumnSubStatement;
    static setType<TYPE extends TypeString>(type: TYPE, initialiser?: Initialiser<AlterColumnSetType<TYPE>>): AlterColumnSetType<TYPE>;
    private constructor();
    compile(): Statement.Queryable[];
}
export declare class AlterColumnSetType<TYPE extends TypeString> extends Statement.Super<AlterColumnSetTypeSubStatement> {
    private readonly type;
    constructor(type: TYPE);
    using(): this;
    protected compileOperation(operation: string): string;
    protected joinParallelOperations(operations: string[]): string;
}
declare class AlterColumnSetTypeSubStatement extends Statement {
    private readonly compiled;
    private readonly vars?;
    static type(type: TypeString): AlterColumnSetTypeSubStatement;
    static using(): AlterColumnSetTypeSubStatement;
    private constructor();
    compile(): Statement.Queryable[];
}
export {};
