"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Delete_1 = __importDefault(require("./statements/Delete"));
const Insert_1 = __importDefault(require("./statements/Insert"));
const Join_1 = __importDefault(require("./statements/Join"));
const Recursive_1 = __importDefault(require("./statements/Recursive"));
const Select_1 = __importDefault(require("./statements/Select"));
const Truncate_1 = __importDefault(require("./statements/Truncate"));
const Update_1 = __importDefault(require("./statements/Update"));
class Table {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
    select(...params) {
        const initialiser = typeof params[params.length - 1] === 'function' ? params.pop() : undefined;
        const input = params.length === 0 ? 1
            : params.length === 1 && typeof params[0] === 'object' ? params[0]
                : params;
        const query = new Select_1.default(this.name, this.schema, input);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return initialiser?.(query) ?? query;
    }
    insert(...params) {
        const isUpsert = params[0] === true;
        if (typeof params[0] === 'boolean')
            params.shift();
        const initialiser = typeof params[params.length - 1] === 'function' ? params.pop() : undefined;
        if (typeof params[0] === 'object') {
            const row = params[0];
            const columns = Object.keys(row).filter(column => row[column] !== undefined);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const query = this.insert(isUpsert, ...columns)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
                .values(...columns.map(key => row[key]));
            return initialiser?.(query) ?? query;
        }
        const query = Insert_1.default.columns(this.name, this.schema, params, isUpsert);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return initialiser?.(query) ?? query;
    }
    upsert(...params) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return this.insert(true, ...params);
    }
    update(data, initialiser) {
        const query = new Update_1.default(this.name, this.schema);
        if (data)
            for (const key of Object.keys(data))
                if (data[key] !== undefined)
                    query.set(key, data[key]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return initialiser?.(query) ?? query;
    }
    delete(initialiser) {
        const query = new Delete_1.default(this.name, this.schema);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return initialiser?.(query) ?? query;
    }
    truncate() {
        return new Truncate_1.default(this.name);
    }
    as(alias1) {
        return {
            innerJoin: (tableName, alias2) => {
                return new Join_1.default('INNER', this.name, tableName, alias1, alias2);
            },
            leftOuterJoin: (tableName, alias2) => {
                return new Join_1.default('LEFT OUTER', this.name, tableName, alias1, alias2);
            },
            rightOuterJoin: (tableName, alias2) => {
                return new Join_1.default('RIGHT OUTER', this.name, tableName, alias1, alias2);
            },
            fullOuterJoin: (tableName, alias2) => {
                return new Join_1.default('FULL OUTER', this.name, tableName, alias1, alias2);
            },
        };
    }
    innerJoin(tableName, alias) {
        return new Join_1.default('INNER', this.name, tableName, undefined, alias);
    }
    leftOuterJoin(tableName, alias) {
        return new Join_1.default('LEFT OUTER', this.name, tableName, undefined, alias);
    }
    rightOuterJoin(tableName, alias) {
        return new Join_1.default('RIGHT OUTER', this.name, tableName, undefined, alias);
    }
    fullOuterJoin(tableName, alias) {
        return new Join_1.default('FULL OUTER', this.name, tableName, undefined, alias);
    }
    recursive(columns, initialiser) {
        const recursive = new Recursive_1.default(this.name, columns);
        initialiser(recursive);
        return recursive;
    }
}
exports.default = Table;
