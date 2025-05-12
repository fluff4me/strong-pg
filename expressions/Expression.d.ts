import Database, { sql } from "../Database";
import { Initialiser, MigrationTypeFromString, OptionalTypeString, TypeString, ValidDate, ValidLiteral, ValidType } from "../IStrongPG";
import { DatabaseSchema, TableSchema } from "../Schema";
import { JoinTables } from "../statements/Join";
import { SelectFromVirtualTable } from "../statements/Select";
import Statement from "../statements/Statement";
export interface ExpressionOperations<VARS = never, CURRENT_VALUE = null> {
    greaterThan: CURRENT_VALUE extends ValidDate ? ExpressionValue<VARS, ValidDate, boolean> : CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
    lessThan: CURRENT_VALUE extends ValidDate ? ExpressionValue<VARS, ValidDate, boolean> : CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
    isNull(): ExpressionOperations<VARS, boolean>;
    isNotNull(): ExpressionOperations<VARS, boolean>;
    equals: ExpressionValue<VARS, CURRENT_VALUE, boolean>;
    notEquals: ExpressionValue<VARS, CURRENT_VALUE, boolean>;
    or: ExpressionValueAddBooleanExpr<VARS>;
    and: ExpressionValueAddBooleanExpr<VARS>;
    matches: CURRENT_VALUE extends string ? ExpressionValue<VARS, RegExp, boolean> : never;
    as<TYPE extends TypeString>(type: TYPE): ExpressionOperations<VARS, MigrationTypeFromString<TYPE>>;
    asEnum<SCHEMA extends DatabaseSchema>(enumName: DatabaseSchema.EnumName<SCHEMA>): ExpressionOperations<VARS, CURRENT_VALUE>;
    add: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never;
    subtract: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never;
    multipliedBy: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never;
    dividedBy: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, number> : never;
}
export interface ExpressionValue<VARS = never, EXPECTED_VALUE = null, RESULT = null> {
    <VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)>(value: ExpressionOr<VARS, VALUE>): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>;
}
export interface ExpressionValueAddBooleanExpr<VARS = never> {
    (value?: ExpressionOr<VARS, boolean>): ExpressionOperations<VARS, boolean>;
}
export interface ExpressionCase<VARS = never, RESULT = null> {
    when(value: ExpressionOr<VARS, boolean>): ExpressionCaseWhen<VARS, RESULT>;
    otherwise(value: ExpressionOr<VARS, RESULT>): ExpressionCase<VARS, RESULT>;
}
export interface ExpressionCaseWhen<VARS = never, RESULT = null> {
    then(value: ExpressionOr<VARS, RESULT>): ExpressionCase<VARS, RESULT>;
}
export interface ExpressionValues<VARS = never, VALUE = null, RESULT = null> {
    case<R extends ValidType>(initialiser: Initialiser<ExpressionCase<VARS, R>, ExpressionCase<VARS, R> | ExpressionCase<VARS, R>[]>): ExpressionOperations<VARS, R>;
    some<T>(values: T[], predicate: (e: ExpressionValues<VARS, null, boolean>, value: T, index: number, values: T[]) => ExpressionOperations<VARS, boolean>): ExpressionOperations<VARS, boolean>;
    every<T>(values: T[], predicate: (e: ExpressionValues<VARS, null, boolean>, value: T, index: number, values: T[]) => ExpressionOperations<VARS, boolean>): ExpressionOperations<VARS, boolean>;
    value: ExpressionValue<VARS, VALUE, RESULT>;
    jsonb(value: ValidLiteral | object): ExpressionOperations<VARS, object>;
    var<VAR extends keyof VARS>(name: VAR): ExpressionOperations<VARS, MigrationTypeFromString<Extract<VARS[VAR], TypeString | OptionalTypeString>>>;
    lowercase: ExpressionValue<VARS, string, string>;
    uppercase: ExpressionValue<VARS, string, string>;
    nextValue(sequenceId: string): ExpressionOperations<VARS, number>;
    currentValue(sequenceId: string): ExpressionOperations<VARS, number>;
    true: ExpressionOperations<VARS, boolean>;
    false: ExpressionOperations<VARS, boolean>;
    exists<DATABASE_SCHEMA extends DatabaseSchema, TABLE extends DatabaseSchema.TableName<DATABASE_SCHEMA>>(database: Database<DATABASE_SCHEMA>, table: TABLE, initialiser: NoInfer<Initialiser<SelectFromVirtualTable<JoinTables<"INNER", Extract<VARS, TableSchema>, DatabaseSchema.Table<DATABASE_SCHEMA, TABLE>, never, TABLE>, never, 1>>>): ExpressionOperations<VARS, boolean>;
    notExists<DATABASE_SCHEMA extends DatabaseSchema, TABLE extends DatabaseSchema.TableName<DATABASE_SCHEMA>>(database: Database<DATABASE_SCHEMA>, table: TABLE, initialiser: NoInfer<Initialiser<SelectFromVirtualTable<JoinTables<"INNER", Extract<VARS, TableSchema>, DatabaseSchema.Table<DATABASE_SCHEMA, TABLE>, never, TABLE>, never, 1>>>): ExpressionOperations<VARS, boolean>;
    coalesce<R extends ValidType>(...values: ExpressionOr<VARS, R>[]): ExpressionOperations<VARS, R>;
}
export type ExpressionInitialiser<VARS, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>;
export type ExpressionOr<VARS, T> = sql | T | ExpressionInitialiser<VARS, T> | ExpressionOperations<any, T>;
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
    static compile(initialiser: ExpressionInitialiser<any, any>, enableStringConcatenation?: boolean, vars?: any[], varMapper?: (varName: string) => string): Statement.Queryable;
    readonly parts: ((varMapper?: (varName: string) => string) => string)[];
    private constructor();
    compile(varMapper?: (varName: string) => string): string;
    greaterThan(value: ExpressionOr<VARS, ValidType>): this;
    lessThan(value: ExpressionOr<VARS, ValidType>): this;
    matches(value: ExpressionOr<VARS, ValidType>): this;
    isNull(): this;
    isNotNull(): this;
    or(value?: ExpressionOr<VARS, boolean>): this;
    and(value?: ExpressionOr<VARS, boolean>): this;
    equals(value: ExpressionOr<VARS, ValidType>): this;
    notEquals(value: ExpressionOr<VARS, ValidType>): this;
    as(type: TypeString): this;
    asEnum<SCHEMA extends DatabaseSchema>(enumName: DatabaseSchema.EnumName<SCHEMA>): this;
    add(value: ExpressionOr<VARS, ValidType>): this;
    subtract(value: ExpressionOr<VARS, ValidType>): this;
    multipliedBy(value: ExpressionOr<VARS, ValidType>): this;
    dividedBy(value: ExpressionOr<VARS, ValidType>): this;
    get true(): this;
    get false(): this;
    case<R extends ValidType>(initialiser: Initialiser<ExpressionCase<VARS, R>, ExpressionCase<VARS, R>[]>): this;
    some(values: any[], predicate: (e: ExpressionValues, value: any, index: number, values: any[]) => any): Expression<never>;
    every(values: any[], predicate: (e: ExpressionValues, value: any, index: number, values: any[]) => any): Expression<never>;
    private innerValue;
    value(value: ExpressionOr<VARS, ValidType>, mapper?: (value: string) => string): Expression<never>;
    jsonb(value: ValidLiteral | object): Expression<never>;
    var(name: keyof VARS): Expression<never>;
    lowercase(value: ExpressionOr<VARS, string>): Expression<never>;
    uppercase(value: ExpressionOr<VARS, string>): Expression<never>;
    nextValue(sequenceId: string): this;
    currentValue(sequenceId: string): this;
    exists(database: Database<any>, table: string, initialiser: Initialiser<SelectFromVirtualTable<any, string, 1>>): Expression<never>;
    notExists(database: Database<any>, table: string, initialiser: Initialiser<SelectFromVirtualTable<any, string, 1>>): Expression<never>;
    coalesce(...values: ExpressionOr<VARS, ValidType>[]): this;
}
