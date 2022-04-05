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
    plpgsql(declarations, plpgsql) {
        if (typeof declarations === "string")
            plpgsql = declarations, declarations = {};
        const declare = Object.entries(declarations).map(([name, type]) => `${name} ${type}`).join(";");
        this.code = `${declare ? `DECLARE ${declare}; ` : ""}BEGIN ${plpgsql} END`;
        this.lang = "plpgsql";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        return this.queryable(`CREATE OR REPLACE FUNCTION ${this.name}() RETURNS trigger AS $$ ${this.code} $$ LANGUAGE ${this.lang}`);
    }
}
exports.default = CreateOrReplaceFunction;
