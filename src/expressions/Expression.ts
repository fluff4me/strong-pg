import { Initialiser, TypeFromString, TypeString, ValidType } from "../IStrongPG";

export interface ExpressionOperations<VARS extends Record<string, TypeString> = never, CURRENT_VALUE = null> {
	greaterThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
	lessThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
}

export interface ExpressionValue<VARS extends Record<string, TypeString> = never, EXPECTED_VALUE = null, RESULT = null> {
	<VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)> (value: VALUE): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>;
	(value: ExpressionInitialiser<VARS, RESULT>): ExpressionOperations<VARS, RESULT>;
}

export interface ExpressionValues<VARS extends Record<string, TypeString> = never, VALUE = null, RESULT = null> {
	value: ExpressionValue<VARS, VALUE, RESULT>;
	var<VAR extends keyof VARS> (name: VAR): ExpressionOperations<VARS, TypeFromString<VARS[VAR]>>;
	lowercase: ExpressionValue<VARS, string, string>;
	uppercase: ExpressionValue<VARS, string, string>;
}

export type ExpressionInitialiser<VARS extends Record<string, TypeString>, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>;

export default class Expression<VARS extends Record<string, TypeString> = never> {

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

	public static stringify (initialiser: ExpressionInitialiser<any, any>) {
		const expr = new Expression();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(expr as any);
		return expr.compile();
	}

	public readonly parts: (() => string)[] = [];

	private constructor () { }

	public compile () {
		return this.parts.map(part => part()).join("");
	}

	public greaterThan (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => ">");
		return this.value(value);
	}

	public lessThan (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => "<");
		return this.value(value);
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

	public var (name: keyof VARS) {
		this.parts.push(() => name as string);
		return this;
	}

	public lowercase (value: string | Initialiser<Expression>) {
		return this.value(value, value => `lower(${value})`);
	}

	public uppercase (value: string | Initialiser<Expression>) {
		return this.value(value, value => `upper(${value})`);
	}
}
