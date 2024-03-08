import { Initialiser, MigrationTypeFromString, TypeString, ValidType } from "../IStrongPG";
import Statement from "../statements/Statement";
export interface ExpressionOperations<VARS = never, CURRENT_VALUE = null> {
    greaterThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
    lessThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
    isNull(): ExpressionOperations<VARS, boolean>;
    equals: ExpressionValue<VARS, CURRENT_VALUE, boolean>;
    or: ExpressionValue<VARS, boolean, boolean>;
    matches: CURRENT_VALUE extends string ? ExpressionValue<VARS, RegExp, boolean> : never;
    as<TYPE extends TypeString>(type: TYPE): ExpressionOperations<VARS, MigrationTypeFromString<TYPE>>;
}
export interface ExpressionValue<VARS = never, EXPECTED_VALUE = null, RESULT = null> {
    <VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)>(value: VALUE): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>;
    (value: ExpressionInitialiser<VARS, RESULT>): ExpressionOperations<VARS, RESULT>;
}
export interface ExpressionValues<VARS = never, VALUE = null, RESULT = null> {
    value: ExpressionValue<VARS, VALUE, RESULT>;
    var<VAR extends keyof VARS>(name: VAR): ExpressionOperations<VARS, MigrationTypeFromString<VARS[VAR] & TypeString>>;
    lowercase: ExpressionValue<VARS, string, string>;
    uppercase: ExpressionValue<VARS, string, string>;
    nextValue(sequenceId: string): ExpressionOperations<VARS, number>;
    currentValue(sequenceId: string): ExpressionOperations<VARS, number>;
}
export type ExpressionInitialiser<VARS, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>;
export type ExpressionOr<VARS, T> = T | ExpressionInitialiser<VARS, T>;
export type ImplementableExpression = {
    [KEY in keyof ExpressionValues | keyof ExpressionOperations]: any;
};
export default class Expression<VARS = never> implements ImplementableExpression {
    vars: any[];
    private readonly enableStringConcatenation;
    static stringifyValue<VARS = never>(value: ExpressionOr<VARS, ValidType>, vars: any[], enableStringConcatenation?: boolean): string;
    /**
     * Warning: Do not use outside of migrations
     */
    static stringifyValueRaw(value: ValidType): string;
    static compile(initialiser: ExpressionInitialiser<any, any>, enableStringConcatenation?: boolean, vars?: any[]): Statement.Queryable;
    readonly parts: (() => string)[];
    private constructor();
    compile(): string;
    greaterThan(value: ValidType | Initialiser<Expression>): this;
    lessThan(value: ValidType | Initialiser<Expression>): this;
    matches(value: ValidType | Initialiser<Expression>): this;
    isNull(): this;
    or(value: ValidType | Initialiser<Expression>): this;
    equals(value: ValidType | Initialiser<Expression>): this;
    as(type: TypeString): this;
    value(value: ValidType | Initialiser<Expression>, mapper?: (value: string) => string): this;
    var(name: keyof VARS): this;
    lowercase(value: string | Initialiser<Expression>): this;
    uppercase(value: string | Initialiser<Expression>): this;
    nextValue(sequenceId: string): this;
    currentValue(sequenceId: string): this;
}
