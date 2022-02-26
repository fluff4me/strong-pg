abstract class Statement {
	public abstract compile (): string | string[];
}

export default Statement;

namespace Statement {
	export abstract class Super<SUB_STATEMENT extends Statement> extends Statement {
		protected readonly parallelOperations: SUB_STATEMENT[] = [];
		protected readonly standaloneOperations: SUB_STATEMENT[] = [];

		protected addParallelOperation<RESULT extends Super<SUB_STATEMENT> = this> (...operations: SUB_STATEMENT[]) {
			this.parallelOperations.push(...operations);
			return this as any as RESULT;
		}

		protected addStandaloneOperation<RESULT extends Super<SUB_STATEMENT> = this> (...operations: SUB_STATEMENT[]) {
			this.standaloneOperations.push(...operations);
			return this as any as RESULT;
		}

		public compile () {
			return [this.compileParallelOperations().join(","), ...this.compileStandaloneOperations()]
				.map(operation => this.compileOperation(operation));
		}

		protected compileParallelOperations (): string[] {
			return this.parallelOperations.flatMap(operation => operation.compile());
		}

		protected compileStandaloneOperations (): string[] {
			return this.standaloneOperations.flatMap(operation => operation.compile());
		}

		protected abstract compileOperation (operation: string): string;
	}
}
