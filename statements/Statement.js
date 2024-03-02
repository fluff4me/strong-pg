"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IStrongPG_1 = require("../IStrongPG");
class Statement {
    setCaller(skip = 0) {
        this.stack = IStrongPG_1.StackUtil.get(skip + 1);
        return this;
    }
    query(pool) {
        let result;
        return Statement.Transaction.execute(pool, async (client) => {
            for (const statement of this.compile())
                result = await pool.query(statement);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return this.resolveQueryOutput(result);
        });
    }
    resolveQueryOutput(output) {
        return undefined;
    }
    queryable(queryables, stack = this.stack, vars) {
        if (!Array.isArray(queryables))
            queryables = [queryables];
        const result = [];
        for (const queryable of queryables) {
            if (typeof queryable === "string")
                result.push(new Statement.Queryable(queryable, stack, vars));
            else {
                queryable.stack ?? (queryable.stack = stack);
                result.push(queryable);
            }
        }
        return result;
    }
}
exports.default = Statement;
(function (Statement) {
    class Queryable {
        constructor(text, stack, values) {
            this.text = text;
            this.stack = stack;
            this.values = values;
        }
    }
    Statement.Queryable = Queryable;
    class Basic extends Statement {
        constructor(queryables) {
            super();
            this.queryables = queryables;
        }
        compile() {
            return this.queryable(this.queryables);
        }
    }
    Statement.Basic = Basic;
    class Super extends Statement {
        constructor() {
            super(...arguments);
            this.parallelOperations = [];
            this.standaloneOperations = [];
        }
        addParallelOperation(...operations) {
            this.parallelOperations.push(...operations);
            return this;
        }
        addStandaloneOperation(...operations) {
            this.standaloneOperations.push(...operations);
            return this;
        }
        compile() {
            const operations = this.compileStandaloneOperations();
            const parallelOperations = this.compileParallelOperations().join(",");
            if (parallelOperations)
                operations.unshift(parallelOperations);
            return operations.flatMap(operation => this.queryable(this.compileOperation(typeof operation === "string" ? operation : operation.text), typeof operation === "string" ? undefined : operation.stack));
        }
        compileParallelOperations() {
            return this.parallelOperations.flatMap(operation => operation.compile()).map(operation => operation.text);
        }
        compileStandaloneOperations() {
            return this.standaloneOperations.flatMap(operation => operation.compile());
        }
    }
    Statement.Super = Super;
})(Statement || (Statement = {}));
