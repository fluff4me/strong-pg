import { Initialiser, TypeFromString, TypeString, ValidType } from "../IStrongPG";
import Statement from "../statements/Statement";

export interface ExpressionOperations<VARS = never, CURRENT_VALUE = null> {
	greaterThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
	lessThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
	isNull (): ExpressionOperations<VARS, boolean>;
	equals: ExpressionValue<VARS, CURRENT_VALUE, boolean>;
	or: ExpressionValue<VARS, boolean, boolean>;
	matches: CURRENT_VALUE extends string ? ExpressionValue<VARS, RegExp, boolean> : never;
	as<TYPE extends TypeString> (type: TYPE): ExpressionOperations<VARS, TypeFromString<TYPE>>;
}

export interface ExpressionValue<VARS = never, EXPECTED_VALUE = null, RESULT = null> {
	<VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)> (value: VALUE): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>;
	(value: ExpressionInitialiser<VARS, RESULT>): ExpressionOperations<VARS, RESULT>;
}

export interface ExpressionValues<VARS = never, VALUE = null, RESULT = null> {
	value: ExpressionValue<VARS, VALUE, RESULT>;
	var<VAR extends keyof VARS> (name: VAR): ExpressionOperations<VARS, TypeFromString<VARS[VAR] & TypeString>>;
	lowercase: ExpressionValue<VARS, string, string>;
	uppercase: ExpressionValue<VARS, string, string>;
	nextValue (sequenceId: string): ExpressionOperations<VARS, number>;
	currentValue (sequenceId: string): ExpressionOperations<VARS, number>;
}

export type ExpressionInitialiser<VARS, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>;

export type ImplementableExpression = { [KEY in keyof ExpressionValues | keyof ExpressionOperations]: any };

export default class Expression<VARS = never> implements ImplementableExpression {

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
				else if (value instanceof RegExp)
					return `'${value.source.replace(/'/g, "''")}'`;
				else
					return value.toISOString();

			case "number":
				return `${value}`;
		}
	}

	public static compile (initialiser: ExpressionInitialiser<any, any>, enableStringConcatenation = false) {
		const expr = new Expression(undefined, enableStringConcatenation);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(expr as any);
		return new Statement.Queryable(expr.compile(), undefined, expr.vars);
	}

	public readonly parts: (() => string)[] = [];

	private constructor (public vars?: any[], private readonly enableStringConcatenation = false) { }

	public compile () {
		return this.parts.map(part => part()).join("");
	}


	////////////////////////////////////
	// Operations

	public greaterThan (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => " > ");
		return this.value(value);
	}

	public lessThan (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => " < ");
		return this.value(value);
	}

	public matches (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => " ~ ");
		return this.value(value);
	}

	public isNull () {
		this.parts.push(() => " IS NULL");
		return this;
	}

	public or (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => " OR ");
		return this.value(value);
	}

	public equals (value: ValidType | Initialiser<Expression>) {
		this.parts.push(() => " = ");
		return this.value(value);
	}

	public as (type: TypeString) {
		this.parts.push(() => ` :: ${type}`);
		return this;
	}


	////////////////////////////////////
	// Values

	public value (value: ValidType | Initialiser<Expression>, mapper?: (value: string) => string) {
		this.parts.push(() => {
			let result: string;
			if (typeof value === "function") {
				const expr = new Expression(this.vars, this.enableStringConcatenation);
				value(expr);
				result = `(${expr.compile()})`;
			} else if (typeof value === "string" && !this.enableStringConcatenation) {
				this.vars ??= [];
				this.vars.push(value);
				result = `$${this.vars.length}`;
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

	public nextValue (sequenceId: string) {
		this.parts.push(() => `nextval('${sequenceId}')`);
		return this;
	}

	public currentValue (sequenceId: string) {
		this.parts.push(() => `currval('${sequenceId}')`);
		return this;
	}
}
