"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IStrongPG_1 = require("../../IStrongPG");
const sql_1 = __importDefault(require("../../sql"));
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
        this.code = sql['asRawSql'];
        this.lang = 'SQL';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    plpgsql(declarations, plpgsql) {
        if (sql_1.default.is(declarations))
            plpgsql = declarations, declarations = {};
        declarations ?? (declarations = {});
        if (!plpgsql)
            throw new Error('No PL/pgSQL code provided');
        const declare = Object.entries(declarations).map(([name, type]) => `${name} ${IStrongPG_1.TypeString.resolve(type)}`).join(';');
        this.code = `${declare ? `DECLARE ${declare}; ` : ''}BEGIN ${plpgsql['asRawSql']} END`;
        this.lang = 'plpgsql';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
    }
    compile() {
        const params = this.argsIn.map(([type, name]) => `${name ?? ''} ${IStrongPG_1.TypeString.resolve(type)}`)
            .concat(this.argsOut.map(([type, name]) => `OUT ${name ?? ''} ${IStrongPG_1.TypeString.resolve(type)}`))
            .join(', ');
        const out = this.returnType ?? 'TRIGGER';
        return this.queryable(`CREATE OR REPLACE FUNCTION ${this.name}(${params}) RETURNS ${out} AS $$ ${this.code} $$ LANGUAGE ${this.lang}`);
    }
}
exports.default = CreateOrReplaceFunction;
