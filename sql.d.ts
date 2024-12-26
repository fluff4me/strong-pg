import { Pool, PoolClient, QueryConfig } from "pg";
type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]];
declare namespace _ {
    interface SQL extends Omit<QueryConfig, "text" | "values"> {
    }
    class SQL implements QueryConfig {
        #private;
        constructor(...data: SqlTemplateData);
        get text(): string;
        get values(): unknown[] | undefined;
        query(pool: Pool | PoolClient): Promise<import("pg").QueryResult<any> | undefined>;
        protected get asRawSql(): string;
    }
}
export type SQL = _.SQL;
export declare namespace SQL {
    function is(value: unknown): value is _.SQL;
}
export declare function sql(segments: TemplateStringsArray, ...interpolations: unknown[]): SQL;
export {};
