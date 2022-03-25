import Statement from "../Statement";
declare type Rename<ENUM extends string[], OLD extends ENUM[number], NEW extends string> = ENUM extends [] ? [] : ENUM extends [infer HEAD, ...infer TAIL] ? HEAD extends OLD ? TAIL : [HEAD, ...Rename<TAIL & string[], OLD, NEW>] : ENUM;
declare type AddValueBefore<ENUM extends string[], PIVOT extends ENUM[number], NEW extends string> = ENUM extends [] ? [] : ENUM extends [infer HEAD, ...infer TAIL] ? HEAD extends PIVOT ? [NEW, PIVOT, ...TAIL] : [HEAD, ...AddValueBefore<TAIL & string[], PIVOT, NEW>] : ENUM;
declare type AddValueAfter<ENUM extends string[], PIVOT extends ENUM[number], NEW extends string> = ENUM extends [] ? [] : ENUM extends [infer HEAD, ...infer TAIL] ? HEAD extends PIVOT ? [PIVOT, NEW, ...TAIL] : [HEAD, ...AddValueAfter<TAIL & string[], PIVOT, NEW>] : ENUM;
export default class AlterEnum<NAME extends string, VALUES extends string[]> extends Statement.Super<AlterEnumSubStatement> {
    readonly name: NAME;
    constructor(name: NAME);
    add<NEW_VALUES extends string[]>(...values: NEW_VALUES): AlterEnum<NAME, [...VALUES, ...NEW_VALUES]>;
    addBefore<NEW_VALUE extends string, PIVOT_VALUE extends VALUES[number]>(newValue: NEW_VALUE, pivotValue: PIVOT_VALUE): AlterEnum<NAME, AddValueBefore<VALUES, PIVOT_VALUE, NEW_VALUE>>;
    addAfter<NEW_VALUE extends string, PIVOT_VALUE extends VALUES[number]>(newValue: NEW_VALUE, pivotValue: PIVOT_VALUE): AlterEnum<NAME, AddValueAfter<VALUES, PIVOT_VALUE, NEW_VALUE>>;
    rename<OLD extends VALUES[number], NEW extends string>(value: OLD, newValue: NEW): AlterEnum<NAME, Rename<VALUES, OLD, NEW>>;
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
    compile(): string;
}
export {};
