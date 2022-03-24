import { Initialiser, ValidType } from "../IStrongPG";

export interface ExpressionOperations<VARS extends string = never> {

}

export interface ExpressionValues<VARS extends string = never> {
	value (value: string | Initialiser<ExpressionValues<VARS>>): ExpressionOperations<VARS>;
	var (name: VARS): ExpressionOperations<VARS>;
	lowercase (value: string | Initialiser<ExpressionValues<VARS>>): ExpressionOperations<VARS>;
	uppercase (value: string | Initialiser<ExpressionValues<VARS>>): ExpressionOperations<VARS>;
}

export default class Expression<VARS extends string = never> implements ExpressionValues, ExpressionOperations {

	/**
	 * Warning: Do not use outside of migrations
	 */
	public static stringifyValue (value: ValidType) {
		switch (typeof value) {
			case "string":
				return `'${value}'`;

			case "symbol":
				return value.description!;

			case "boolean":
				return value ? "TRUE" : "FALSE";

			case "undefined":
				return "NULL";

			case "object":
				if (value === null)
					return "NULL";
				else
					return value.toISOString();

			case "number":
				return `${value}`;
		}
	}

	public readonly parts: (() => string)[] = [];

	public compile () {
		return this.parts.map(part => part()).join("");
	}

	public value (value: ValidType | Initialiser<Expression>, mapper?: (value: string) => string) {
		this.parts.push(() => {
			let result: string;
			if (typeof value === "function") {
				const expr = new Expression();
				value(expr);
				result = expr.compile();
			} else {
				result = Expression.stringifyValue(value);
			}

			return mapper ? mapper(result) : result;
		});

		return this;
	}

	public var (name: VARS) {
		this.parts.push(() => name);
		return this;
	}

	public lowercase (value: string | Initialiser<Expression>) {
		return this.value(value, value => `lower(${value})`);
	}

	public uppercase (value: string | Initialiser<Expression>) {
		return this.value(value, value => `upper(${value})`);
	}
}
