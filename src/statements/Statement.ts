import { StackUtil } from "../IStrongPG";

abstract class Statement {

	public stack?: StackUtil.Stack;
	public setCaller (skip = 0) {
		this.stack = StackUtil.get(skip + 1);
		return this;
	}

	public abstract compile (): Statement.Queryable[];

	protected queryable (queryables: string | Statement.Queryable | (string | Statement.Queryable)[], stack = this.stack) {
		if (!Array.isArray(queryables))
			queryables = [queryables as string];

		const result: Statement.Queryable[] = [];

		for (const queryable of queryables) {
			if (typeof queryable === "string")
				result.push(new Statement.Queryable(queryable, stack));
			else {
				queryable.stack ??= stack;
				result.push(queryable);
			}
		}

		return result;
	}
}

export default Statement;

namespace Statement {

	export class Queryable {
		public constructor (public readonly text: string, public stack?: StackUtil.Stack) { }
	}

	export class Basic extends Statement {
		public constructor (private readonly queryables: string | string[] | Queryable | Queryable[]) {
			super();
		}

		public compile () {
			return this.queryable(this.queryables);
		}
	}

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
			const operations: (string | Queryable)[] = this.compileStandaloneOperations();
			const parallelOperations = this.compileParallelOperations().join(",");
			if (parallelOperations)
				operations.unshift(parallelOperations);
			return operations.flatMap(operation => this.queryable(this.compileOperation(
				typeof operation === "string" ? operation : operation.text),
				typeof operation === "string" ? undefined : operation.stack));
		}

		protected compileParallelOperations (): string[] {
			return this.parallelOperations.flatMap(operation => operation.compile()).map(operation => operation.text);
		}

		protected compileStandaloneOperations () {
			return this.standaloneOperations.flatMap(operation => operation.compile());
		}

		protected abstract compileOperation (operation: string): string;
	}
}
