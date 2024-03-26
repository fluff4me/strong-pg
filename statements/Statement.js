"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const IStrongPG_1 = require("../IStrongPG");
const Log_1 = __importStar(require("../Log"));
class Statement {
    setCaller(skip = 0) {
        this.stack = IStrongPG_1.StackUtil.get(skip + 1);
        return this;
    }
    query(pool) {
        let result;
        return Statement.Transaction.execute(pool, async (client) => {
            for (const statement of this.compile()) {
                (0, Log_1.default)("  > ", (0, Log_1.color)("darkGray", statement.text));
                if (statement.values?.length)
                    for (let i = 0; i < statement.values.length; i++)
                        (0, Log_1.default)(`    ${(0, Log_1.color)("lightYellow", `$${i + 1}`)}${(0, Log_1.color)("darkGray", ":")} `, util_1.default.inspect(statement.values[i], undefined, Infinity, true));
                result = await client.query(statement);
            }
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
            const parallelOperations = this.joinParallelOperations(this.compileParallelOperations());
            if (parallelOperations)
                operations.unshift(parallelOperations);
            return operations.flatMap(operation => this.queryable(this.compileOperation(typeof operation === "string" ? operation : operation.text), typeof operation === "string" ? undefined : operation.stack));
        }
        joinParallelOperations(operations) {
            return operations.join(",");
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
