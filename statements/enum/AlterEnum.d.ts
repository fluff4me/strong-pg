import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";
type Rename<ENUM extends string[], OLD extends ENUM[number], NEW extends string> = ENUM extends [] ? [] : ENUM extends [infer HEAD, ...infer TAIL] ? HEAD extends OLD ? TAIL : [HEAD, ...Rename<TAIL & string[], OLD, NEW>] : ENUM;
type AddValueBefore<ENUM extends string[], PIVOT extends ENUM[number], NEW extends string> = ENUM extends [] ? [] : ENUM extends [infer HEAD, ...infer TAIL] ? HEAD extends PIVOT ? [NEW, PIVOT, ...TAIL] : [HEAD, ...AddValueBefore<TAIL & string[], PIVOT, NEW>] : ENUM;
type AddValueAfter<ENUM extends string[], PIVOT extends ENUM[number], NEW extends string> = ENUM extends [] ? [] : ENUM extends [infer HEAD, ...infer TAIL] ? HEAD extends PIVOT ? [PIVOT, NEW, ...TAIL] : [HEAD, ...AddValueAfter<TAIL & string[], PIVOT, NEW>] : ENUM;
export type AlterEnumInitialiser<VALUES_START extends string[], VALUES_END extends string[]> = Initialiser<AlterEnum<VALUES_START>, AlterEnum<VALUES_END>>;
export default class AlterEnum<VALUES extends string[]> extends Statement.Super<AlterEnumSubStatement> {
    readonly name: string;
    constructor(name: string);
    add<NEW_VALUES extends string[]>(...values: NEW_VALUES): AlterEnum<[...VALUES, ...NEW_VALUES]>;
    addBefore<NEW_VALUE extends string, PIVOT_VALUE extends VALUES[number]>(newValue: NEW_VALUE, pivotValue: PIVOT_VALUE): AlterEnum<AddValueBefore<VALUES, PIVOT_VALUE, NEW_VALUE>>;
    addAfter<NEW_VALUE extends string, PIVOT_VALUE extends VALUES[number]>(newValue: NEW_VALUE, pivotValue: PIVOT_VALUE): AlterEnum<AddValueAfter<VALUES, PIVOT_VALUE, NEW_VALUE>>;
    rename<OLD extends VALUES[number], NEW extends string>(value: OLD, newValue: NEW): AlterEnum<Rename<VALUES, OLD, NEW>>;
    private do;
    protected compileOperation(operation: string): string;
}
declare class AlterEnumSubStatement extends Statement {
    private readonly compiled;
    static addValues(...values: string[]): AlterEnumSubStatement[];
    static renameValue(oldValue: string, newValue: string): AlterEnumSubStatement;
    static addValueBefore(newValue: string, pivotValue: string): AlterEnumSubStatement;
    static addValueAfter(newValue: string, pivotValue: string): AlterEnumSubStatement;
    private constructor();
    compile(): Statement.Queryable[];
}
export {};
