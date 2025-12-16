import type { Pool, PoolClient, QueryConfig } from 'pg';
import type { ExpressionInitialiser } from './expressions/Expression';
type SqlTemplateData = [segments: readonly string[], interpolations: unknown[]];
interface SQL extends Omit<QueryConfig, 'text' | 'values'> {
}
declare class SQL implements QueryConfig {
    #private;
    constructor(...data: SqlTemplateData);
    get text(): string;
    get values(): unknown[] | undefined;
    compile(vars: unknown[]): string;
    query(pool: Pool | PoolClient): Promise<import("pg").QueryResult<any>>;
    /** @deprecated be careful!!! */
    protected get asRawSql(): string;
}
type sql = SQL;
declare function sql(segments: readonly string[], ...interpolations: unknown[]): sql;
declare namespace sql {
    type Result<RESULT> = sql & ExpressionInitialiser<any, RESULT>;
    function is(value: unknown): value is SQL;
    function join(segments: readonly unknown[], separator: sql): sql;
    function raw(text: string): sql;
}
export default sql;
