"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = __importDefault(require("../Statement"));
class CreateOrReplaceFunction/*<IN extends [TypeString, string?][], INOUT extends [TypeString, string?][], OUT extends [TypeString, string?][]>*/  extends Statement_1.default {
    constructor(name) {
        super();
        this.name = name;
    }
    // public in<TYPE extends TypeString, NAME extends string | undefined> (type: TYPE, name?: NAME): CreateOrReplaceFunction<[...IN, [TYPE, NAME]], OUT> {
    // 	return this;
    // }
    // public out<TYPE extends TypeString, NAME extends string | undefined> (type: TYPE, name?: NAME): CreateOrReplaceFunction<IN, [...OUT, [TYPE, NAME]]> {
    // 	return this;
    // }
    sql(sql) {
        this.code = sql;
        this.lang = "SQL";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    plpgsql(plpgsql) {
        this.code = plpgsql;
        this.lang = "plpgsql";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        return `CREATE OR REPLACE FUNCTION ${this.name}() RETURNS trigger AS $$ BEGIN ${this.code} END $$ LANGUAGE ${this.lang}`;
    }
}
exports.default = CreateOrReplaceFunction;
