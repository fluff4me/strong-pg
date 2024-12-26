"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../../sql");
const Statement_1 = __importDefault(require("../Statement"));
class CreateOrReplaceFunction extends Statement_1.default {
    constructor(name) {
        super();
        this.name = name;
        this.argsIn = [];
        this.argsOut = [];
    }
    in(type, name) {
        this.argsIn.push([type, name]);
        return this;
    }
    out(type, name) {
        this.argsOut.push([type, name]);
        return this;
    }
    returns(type) {
        this.returnType = type;
        return this;
    }
    sql(sql) {
        this.code = sql;
        this.lang = "SQL";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    plpgsql(declarations, plpgsql) {
        if ((0, sql_1.isSql)(declarations))
            plpgsql = declarations, declarations = {};
        if (!plpgsql)
            throw new Error("No PL/pgSQL code provided");
        if (plpgsql.values?.length)
            throw new Error("Values are not allowed in PL/pgSQL function code");
        const declare = Object.entries(declarations).map(([name, type]) => `${name} ${type}`).join(";");
        this.code = `${declare ? `DECLARE ${declare}; ` : ""}BEGIN ${plpgsql.text} END`;
        this.lang = "plpgsql";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        const params = this.argsIn.map(([type, name]) => `${name ?? ""} ${typeof type === "string" ? type : type.type}`)
            .concat(this.argsOut.map(([type, name]) => `OUT ${name ?? ""} ${type}`))
            .join(", ");
        const out = this.returnType ?? "TRIGGER";
        return this.queryable(`CREATE OR REPLACE FUNCTION ${this.name}(${params}) RETURNS ${out} AS $$ ${this.code} $$ LANGUAGE ${this.lang}`);
    }
}
exports.default = CreateOrReplaceFunction;
