"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../statements/Statement"));
class Expression {
    static stringifyValue(value, vars, enableStringConcatenation = false) {
        if (typeof value === "function") {
            let expr = new Expression(vars, enableStringConcatenation);
            const result = value(expr);
            if (result instanceof Expression && result !== expr)
                expr = result;
            return `(${expr.compile()})`;
        }
        if (value instanceof Expression) {
            return `(${value.compile()})`;
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
    static stringifyValueRaw(value) {
        switch (typeof value) {
            case "string":
                return `'${value}'`;
            case "symbol":
                return value.description;
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
    static compile(initialiser, enableStringConcatenation = false, vars, varMapper) {
        let expr = new Expression(vars ?? [], enableStringConcatenation);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const result = initialiser(expr);
        if (result instanceof Expression && result !== expr)
            expr = result;
        return new Statement_1.default.Queryable(expr.compile(varMapper), undefined, expr.vars);
    }
    constructor(vars, enableStringConcatenation = false) {
        this.vars = vars;
        this.enableStringConcatenation = enableStringConcatenation;
        this.parts = [];
    }
    compile(varMapper) {
        return this.parts.map(part => part(varMapper)).join("");
    }
    ////////////////////////////////////
    // Operations
    greaterThan(value) {
        this.parts.push(() => " > ");
        return this.innerValue(value);
    }
    lessThan(value) {
        this.parts.push(() => " < ");
        return this.innerValue(value);
    }
    matches(value) {
        this.parts.push(() => " ~ ");
        return this.innerValue(value);
    }
    isNull() {
        this.parts.push(() => " IS NULL");
        return this;
    }
    or(value) {
        this.parts.push(() => " OR ");
        return this.innerValue(value);
    }
    and(value) {
        this.parts.push(() => " AND ");
        return this.innerValue(value);
    }
    equals(value) {
        this.parts.push(() => " = ");
        return this.innerValue(value);
    }
    notEquals(value) {
        this.parts.push(() => " != ");
        return this.innerValue(value);
    }
    as(type) {
        this.parts.push(() => ` :: ${type}`);
        return this;
    }
    asEnum(enumName) {
        this.parts.push(() => ` :: ${enumName}`);
        return this;
    }
    ////////////////////////////////////
    // Values
    get true() {
        this.parts.push(() => "1=1");
        return this;
    }
    get false() {
        this.parts.push(() => "1=0");
        return this;
    }
    case(initialiser) {
        const whens = [];
        let when;
        const builder = {
            when: value => {
                when = [value, undefined];
                return builder;
            },
            then: value => {
                if (!when)
                    throw new Error("Cannot add 'then' value to no 'when' expression");
                when[1] = value;
                whens.push(when);
                when = undefined;
                return builder;
            },
        };
        initialiser(builder);
        this.parts.push(() => {
            const whensString = whens
                .map(([when, then]) => {
                const whenString = Expression.stringifyValue(when, this.vars, this.enableStringConcatenation);
                const thenString = Expression.stringifyValue(then, this.vars, this.enableStringConcatenation);
                return `WHEN (${whenString}) THEN (${thenString})`;
            })
                .join(" ");
            return `CASE ${whensString} END`;
        });
        return this;
    }
    some(values, predicate) {
        this.parts.push(() => values
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .map((value, i) => Expression.stringifyValue(expression => predicate(expression, value, i, values), this.vars, this.enableStringConcatenation))
            .join(" OR "));
        return this;
    }
    every(values, predicate) {
        this.parts.push(() => values
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .map((value, i) => Expression.stringifyValue(expression => predicate(expression, value, i, values), this.vars, this.enableStringConcatenation))
            .join(" AND "));
        return this;
    }
    innerValue(value, mapper) {
        this.parts.push(() => {
            const stringified = Expression.stringifyValue(value, this.vars, this.enableStringConcatenation);
            return mapper ? mapper(stringified) : stringified;
        });
        return this;
    }
    value(value, mapper) {
        return new Expression(this.vars, this.enableStringConcatenation)
            .innerValue(value, mapper);
    }
    var(name) {
        const e = new Expression(this.vars, this.enableStringConcatenation);
        e.parts.push((varMapper) => varMapper?.(name) ?? name);
        return e;
    }
    lowercase(value) {
        return this.value(value, value => `lower(${value})`);
    }
    uppercase(value) {
        return this.value(value, value => `upper(${value})`);
    }
    nextValue(sequenceId) {
        this.parts.push(() => `nextval('${sequenceId}')`);
        return this;
    }
    currentValue(sequenceId) {
        this.parts.push(() => `currval('${sequenceId}')`);
        return this;
    }
}
exports.default = Expression;