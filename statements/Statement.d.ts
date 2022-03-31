import { StackUtil } from "../IStrongPG";
declare abstract class Statement {
    stack?: StackUtil.Stack;
    setCaller(skip?: number): this;
    abstract compile(): Statement.Queryable[];
    protected queryable(queryables: string | Statement.Queryable | (string | Statement.Queryable)[], stack?: StackUtil.Stack | undefined): Statement.Queryable[];
}
export default Statement;
declare namespace Statement {
    class Queryable {
        readonly text: string;
        stack?: StackUtil.Stack | undefined;
        constructor(text: string, stack?: StackUtil.Stack | undefined);
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
        protected compileParallelOperations(): string[];
        protected compileStandaloneOperations(): Queryable[];
        protected abstract compileOperation(operation: string): string;
    }
}
