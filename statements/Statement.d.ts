import { Pool, PoolClient, QueryResult } from "pg";
import { StackUtil } from "../IStrongPG";
declare abstract class Statement<RESULT = void> {
    private static Transaction;
    stack?: StackUtil.Stack;
    setCaller(skip?: number): this;
    abstract compile(): Statement.Queryable[];
    query(pool: Pool | PoolClient): Promise<RESULT>;
    protected resolveQueryOutput(output: QueryResult): RESULT;
    protected queryable(queryables: string | Statement.Queryable | (string | Statement.Queryable)[], stack?: StackUtil.Stack | undefined, vars?: any[]): Statement.Queryable[];
}
export default Statement;
declare namespace Statement {
    class Queryable {
        readonly text: string;
        stack?: StackUtil.Stack | undefined;
        values?: any[] | undefined;
        constructor(text: string, stack?: StackUtil.Stack | undefined, values?: any[] | undefined);
    }
    class Basic extends Statement {
        private readonly queryables;
        constructor(queryables: string | string[] | Queryable | Queryable[]);
        compile(): Queryable[];
    }
    abstract class Super<SUB_STATEMENT extends Statement> extends Statement {
        protected readonly parallelOperations: SUB_STATEMENT[];
        protected readonly standaloneOperations: SUB_STATEMENT[];
        protected addParallelOperation<RESULT extends Super<SUB_STATEMENT> = this>(...operations: SUB_STATEMENT[]): RESULT;
        protected addStandaloneOperation<RESULT extends Super<SUB_STATEMENT> = this>(...operations: SUB_STATEMENT[]): RESULT;
        compile(): Queryable[];
        protected joinParallelOperations(operations: string[]): string;
        protected compileParallelOperations(): string[];
        protected compileStandaloneOperations(): Queryable[];
        protected abstract compileOperation(operation: string): string;
    }
}
