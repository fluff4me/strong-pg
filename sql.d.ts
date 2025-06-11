import { Pool, PoolClient, QueryConfig } from "pg";
import { ExpressionInitialiser } from "./expressions/Expression";
type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]];
interface SQL extends Omit<QueryConfig, "text" | "values"> {
}
declare class SQL implements QueryConfig {
    #private;
    constructor(...data: SqlTemplateData);
    get text(): string;
    get values(): unknown[] | undefined;
    query(pool: Pool | PoolClient): Promise<import("pg").QueryResult<any> | undefined>;
    protected get asRawSql(): string;
}
type sql = SQL;
declare function sql(segments: TemplateStringsArray, ...interpolations: unknown[]): sql;
declare namespace sql {
    type Result<RESULT> = sql & ExpressionInitialiser<any, RESULT>;
    function is(value: unknown): value is SQL;
    function join(segments: unknown[], separator: sql): sql;
}
export default sql;
