import { Initialiser, MigrationTypeFromString, TypeString, ValidType } from "../IStrongPG";
import Statement from "../statements/Statement";

export interface ExpressionOperations<VARS = never, CURRENT_VALUE = null> {
	greaterThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
	lessThan: CURRENT_VALUE extends number ? ExpressionValue<VARS, number, boolean> : never;
	isNull (): ExpressionOperations<VARS, boolean>;
	equals: ExpressionValue<VARS, CURRENT_VALUE, boolean>;
	or: ExpressionValue<VARS, boolean, boolean>;
	matches: CURRENT_VALUE extends string ? ExpressionValue<VARS, RegExp, boolean> : never;
	as<TYPE extends TypeString> (type: TYPE): ExpressionOperations<VARS, MigrationTypeFromString<TYPE>>;
}

export interface ExpressionValue<VARS = never, EXPECTED_VALUE = null, RESULT = null> {
	<VALUE extends (EXPECTED_VALUE extends null ? ValidType : EXPECTED_VALUE)> (value: VALUE): ExpressionOperations<VARS, RESULT extends null ? VALUE : RESULT>;
	(value: ExpressionInitialiser<VARS, RESULT>): ExpressionOperations<VARS, RESULT>;
}

export interface ExpressionValues<VARS = never, VALUE = null, RESULT = null> {
	value: ExpressionValue<VARS, VALUE, RESULT>;
	var<VAR extends keyof VARS> (name: VAR): ExpressionOperations<VARS, MigrationTypeFromString<VARS[VAR] & TypeString>>;
	lowercase: ExpressionValue<VARS, string, string>;
	uppercase: ExpressionValue<VARS, string, string>;
	nextValue (sequenceId: string): ExpressionOperations<VARS, number>;
	currentValue (sequenceId: string): ExpressionOperations<VARS, number>;
}

export type ExpressionInitialiser<VARS, RESULT = any> = Initialiser<ExpressionValues<VARS, null, null>, ExpressionOperations<VARS, RESULT>>;

export type ExpressionOr<VARS, T> = T | ExpressionInitialiser<VARS, T>;

export type ImplementableExpression = { [KEY in keyof ExpressionValues | keyof ExpressionOperations]: any };

export default class Expression<VARS = never> implements ImplementableExpression {

	public static stringifyValue<VARS = never> (value: ExpressionOr<VARS, ValidType>, vars: any[], enableStringConcatenation = false) {
		if (typeof value === "function") {
			const expr = new Expression(vars, enableStringConcatenation);
			value(expr as any as ExpressionValues<VARS, null, null>);
			return `(${expr.compile()})`;
		}

		const shouldPassAsVariable = false
			|| (typeof value === "string" && !enableStringConcatenation)
			|| (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp));
		if (!shouldPassAsVariable)
			return Expression.stringifyValueRaw(value);

		const index = vars.indexOf(value);
		if (index !== undefined && index !== -1)
			// already in vars
			return `$${index + 1}`;

		vars.push(value);
		return `$${vars.length}`;
	}

	/**
	 * Warning: Do not use outside of migrations
	 */
	public static stringifyValueRaw (value: ValidType) {
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
					return `'${value.toISOString()}'`;

			case "number":
				return `${value}`;
		}
	}

	public static compile (initialiser: ExpressionInitialiser<any, any>, enableStringConcatenation = false, vars?: any[]) {
		const expr = new Expression(vars ?? [], enableStringConcatenation);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(expr as any);
		return new Statement.Queryable(expr.compile(), undefined, expr.vars);
	}

	public readonly parts: (() => string)[] = [];

	private constructor (public vars: any[], private readonly enableStringConcatenation = false) { }

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
			const stringified = Expression.stringifyValue(value as ValidType | ExpressionInitialiser<VARS>, this.vars, this.enableStringConcatenation);
			return mapper ? mapper(stringified) : stringified;
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
