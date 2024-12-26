import { QueryConfig } from "pg";
type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]];
declare namespace _ {
    interface Sql extends Omit<QueryConfig, "text" | "values"> {
    }
    class Sql implements QueryConfig {
        #private;
        constructor(...data: SqlTemplateData);
        get text(): string;
        get values(): unknown[];
        protected get asRawSql(): string;
    }
}
export type Sql = _.Sql;
export declare namespace Sql {
    function is(value: unknown): value is _.Sql;
}
export declare function sql(segments: TemplateStringsArray, ...interpolations: unknown[]): QueryConfig;
export {};
