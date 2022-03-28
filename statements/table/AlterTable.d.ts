import { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser, SetKey, TypeFromString, TypeString } from "../../IStrongPG";
import Schema from "../../Schema";
import Statement from "../Statement";
export declare type AlterTableInitialiser<SCHEMA_START, SCHEMA_END> = Initialiser<AlterTable<SCHEMA_START>, AlterTable<SCHEMA_START, SCHEMA_END>>;
export default class AlterTable<SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<Statement> {
    readonly table: string;
    protected readonly schemaStart: SCHEMA_START;
    protected readonly schemaEnd: SCHEMA_END;
    constructor(table: string);
    private do;
    private doStandalone;
    addColumn<NAME extends string, TYPE extends TypeString>(name: NAME, type: TYPE, alter?: Initialiser<AlterColumn<NAME, TYPE>>): AlterTable<SCHEMA_START, SetKey<SCHEMA_END, NAME, TYPE>>;
    dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string>(name: NAME): AlterTable<SCHEMA_START, Omit<SCHEMA_END, NAME>>;
    renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string>(name: NAME, newName: NAME_NEW): AlterTable<SCHEMA_START, Omit<SCHEMA_END, NAME> & { [KEY in NAME_NEW]: SCHEMA_END[NAME]; }>;
    addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]>(...keys: KEYS): AlterTable<SCHEMA_START, Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>;
    dropPrimaryKey(): AlterTable<SCHEMA_START, Schema.DropPrimaryKey<SCHEMA_END>>;
    check(id: string, value: ExpressionInitialiser<Schema.Columns<SCHEMA_END>, boolean>): AlterTable<SCHEMA_START, SCHEMA_END>;
    schema<SCHEMA_TEST extends SCHEMA_END>(): SCHEMA_END extends SCHEMA_TEST ? AlterTable<SCHEMA_START, SCHEMA_TEST> : null;
    protected compileOperation(operation: string): string;
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
    static setDefault<TYPE extends TypeString>(value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>): AlterColumnSubStatement;
    static setNotNull(): AlterColumnSubStatement;
    private constructor();
    compile(): string;
}
export {};
