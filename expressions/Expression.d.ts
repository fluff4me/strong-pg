import { Initialiser, TypeFromString, TypeString, ValidType } from "../IStrongPG";
export interface ExpressionOperations<VARS extends Record<string, TypeString> = never, CURRENT_VALUE = null> {
    greaterThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
    lessThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
    isNull(): ExpressionOperations<VARS, boolean>;
    eq: ExpressionValue<VARS, CURRENT_VALUE, boolean>;
    or: ExpressionValue<VARS, boolean, boolean>;
}
export interface ExpressionValue<VARS extends Record<string, TypeString> = never, EXPECTED_VALUE = null, RESULT = null> {
    <VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)>(value: VALUE): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>;
    (value: ExpressionInitialiser<VARS, RESULT>): ExpressionOperations<VARS, RESULT>;
}
export interface ExpressionValues<VARS extends Record<string, TypeString> = never, VALUE = null, RESULT = null> {
    value: ExpressionValue<VARS, VALUE, RESULT>;
    var<VAR extends keyof VARS>(name: VAR): ExpressionOperations<VARS, TypeFromString<VARS[VAR]>>;
    lowercase: ExpressionValue<VARS, string, string>;
    uppercase: ExpressionValue<VARS, string, string>;
}
export declare type ExpressionInitialiser<VARS extends Record<string, TypeString>, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>;
export declare type ImplementableExpression = {
    [KEY in keyof ExpressionValues | keyof ExpressionOperations]: any;
};
export default class Expression<VARS extends Record<string, TypeString> = never> implements ImplementableExpression {
    /**
     * Warning: Do not use outside of migrations
     */
    static stringifyValue(value: ValidType): string;
    static stringify(initialiser: ExpressionInitialiser<any, any>): string;
    readonly parts: (() => string)[];
    private constructor();
    compile(): string;
    greaterThan(value: ValidType | Initialiser<Expression>): this;
    lessThan(value: ValidType | Initialiser<Expression>): this;
    isNull(): this;
    or(value: ValidType | Initialiser<Expression>): this;
    eq(value: ValidType | Initialiser<Expression>): this;
    value(value: ValidType | Initialiser<Expression>, mapper?: (value: string) => string): this;
    var(name: keyof VARS): this;
    lowercase(value: string | Initialiser<Expression>): this;
    uppercase(value: string | Initialiser<Expression>): this;
}
