declare abstract class Statement {
    abstract compile(): string | string[];
}
export default Statement;
declare namespace Statement {
    abstract class Super<SUB_STATEMENT extends Statement> extends Statement {
        protected readonly parallelOperations: SUB_STATEMENT[];
        protected readonly standaloneOperations: SUB_STATEMENT[];
        protected addParallelOperation<RESULT extends Super<SUB_STATEMENT> = this>(...operations: SUB_STATEMENT[]): RESULT;
        protected addStandaloneOperation<RESULT extends Super<SUB_STATEMENT> = this>(...operations: SUB_STATEMENT[]): RESULT;
        compile(): string[];
        protected compileParallelOperations(): string[];
        protected compileStandaloneOperations(): string[];
        protected abstract compileOperation(operation: string): string;
    }
}
