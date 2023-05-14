"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Expression {
    /**
     * Warning: Do not use outside of migrations
     */
    static stringifyValue(value) {
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
                    return value.toISOString();
            case "number":
                return `${value}`;
        }
    }
    static stringify(initialiser) {
        const expr = new Expression();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(expr);
        return expr.compile();
    }
    constructor() {
        this.parts = [];
    }
    compile() {
        return this.parts.map(part => part()).join("");
    }
    ////////////////////////////////////
    // Operations
    greaterThan(value) {
        this.parts.push(() => " > ");
        return this.value(value);
    }
    lessThan(value) {
        this.parts.push(() => " < ");
        return this.value(value);
    }
    matches(value) {
        this.parts.push(() => " ~ ");
        return this.value(value);
    }
    isNull() {
        this.parts.push(() => " IS NULL");
        return this;
    }
    or(value) {
        this.parts.push(() => " OR ");
        return this.value(value);
    }
    equals(value) {
        this.parts.push(() => " = ");
        return this.value(value);
    }
    as(type) {
        this.parts.push(() => ` :: ${type}`);
        return this;
    }
    ////////////////////////////////////
    // Values
    value(value, mapper) {
        this.parts.push(() => {
            let result;
            if (typeof value === "function") {
                const expr = new Expression();
                value(expr);
                result = `(${expr.compile()})`;
            }
            else {
                result = Expression.stringifyValue(value);
            }
            return mapper ? mapper(result) : result;
        });
        return this;
    }
    var(name) {
        this.parts.push(() => name);
        return this;
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
