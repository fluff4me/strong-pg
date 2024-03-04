"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../statements/Statement"));
class Expression {
    static stringifyValue(value, vars, enableStringConcatenation = false) {
        let result;
        if (typeof value === "function") {
            const expr = new Expression(vars, enableStringConcatenation);
            value(expr);
            result = `(${expr.compile()})`;
        }
        else if (typeof value === "string" && !enableStringConcatenation) {
            vars ?? (vars = []);
            vars.push(value);
            result = `$${vars.length}`;
        }
        else {
            result = Expression.stringifyValueRaw(value);
        }
        return result;
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
                    return value.toISOString();
            case "number":
                return `${value}`;
        }
    }
    static compile(initialiser, enableStringConcatenation = false, vars) {
        const expr = new Expression(vars, enableStringConcatenation);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        initialiser(expr);
        return new Statement_1.default.Queryable(expr.compile(), undefined, expr.vars);
    }
    constructor(vars, enableStringConcatenation = false) {
        this.vars = vars;
        this.enableStringConcatenation = enableStringConcatenation;
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
            const stringified = Expression.stringifyValue(value, this.vars, this.enableStringConcatenation);
            return mapper ? mapper(stringified) : stringified;
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
