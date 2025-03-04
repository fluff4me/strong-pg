import { Initialiser, OptionalTypeString, TypeString } from "../../IStrongPG";
import { DatabaseSchema } from "../../Schema";
import Statement from "../Statement";
export type AlterTypeInitialiser<DB extends DatabaseSchema, SCHEMA_START, SCHEMA_END> = Initialiser<AlterType<DB, SCHEMA_START>, AlterType<DB, SCHEMA_START, SCHEMA_END>>;
export default class AlterType<DB extends DatabaseSchema, SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<AlterTypeSubStatement> {
    readonly name: string;
    constructor(name: string);
    addAttribute<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString = OptionalTypeString<TYPE>>(name: NAME, type: TYPE): AlterType<DB, SCHEMA_START, { [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    renameAttribute<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString = OptionalTypeString<TYPE>>(name: NAME, type: TYPE): AlterType<DB, SCHEMA_START, { [KEY in keyof SCHEMA_END | NAME]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    alterAttribute<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString = OptionalTypeString<TYPE>>(name: NAME, type: TYPE): AlterType<DB, SCHEMA_START, { [KEY in keyof SCHEMA_END | NAME]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END]; }>;
    dropAttribute<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string>(name: NAME): AlterType<DB, SCHEMA_START, Omit<SCHEMA_END, NAME>>;
    private do;
    protected compileOperation(operation: string): string;
}
declare class AlterTypeSubStatement extends Statement {
    private readonly compiled;
    static addAttributes<NAME extends string, TYPE extends TypeString>(column: NAME, type: TYPE): AlterTypeSubStatement;
    static renameAttribute(oldAttribute: string, newAttribute: string): AlterTypeSubStatement;
    static dropAttribute(attribute: string): AlterTypeSubStatement;
    static alterAttribute<NAME extends string, TYPE extends TypeString>(attribute: NAME, type: TYPE): AlterTypeSubStatement;
    private constructor();
    compile(): Statement.Queryable[];
}
export {};
