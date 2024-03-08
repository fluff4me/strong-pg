"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Insert_1 = __importDefault(require("./statements/Insert"));
const Select_1 = __importDefault(require("./statements/Select"));
const Update_1 = __importDefault(require("./statements/Update"));
class Table {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
    select(...params) {
        const initialiser = typeof params[params.length - 1] === "function" ? params.pop() : undefined;
        if (params.length === 0)
            params.push("*");
        const query = new Select_1.default(this.name, this.schema, params);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return initialiser?.(query) ?? query;
    }
    insert(...params) {
        const isUpsert = params[0] === true;
        if (typeof params[0] === "boolean")
            params.shift();
        const initialiser = typeof params[params.length - 1] === "function" ? params.pop() : undefined;
        if (typeof params[0] === "object") {
            const keys = Object.keys(params[0]);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const query = this.insert(isUpsert, ...keys)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                .values(...keys.map(key => params[0][key]));
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
        for (const key of Object.keys(data))
            query.set(key, data[key]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return initialiser?.(query) ?? query;
    }
}
exports.default = Table;
