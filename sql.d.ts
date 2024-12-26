import { QueryConfig } from "pg";
declare const SYMBOL_SQL: unique symbol;
type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]];
export interface Sql extends QueryConfig {
    [SYMBOL_SQL]: SqlTemplateData;
}
export declare function isSql(value: unknown): value is Sql;
export declare function sql(segments: TemplateStringsArray, ...interpolations: unknown[]): QueryConfig;
export {};
