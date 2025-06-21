"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = __importDefault(require("./sql"));
class Schema {
    static database(schema) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema;
    }
    static enum(enm) {
        const schema = {
            VALUES: [],
        };
        for (let i = 0;; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const value = enm[i];
            if (typeof value !== "string")
                break;
            schema.VALUES.push(value);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            schema[value] = value;
        }
        return schema;
    }
    static table(schema) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema;
    }
    static triggerFunction(version) {
        return {
            sql(sql) {
                return {
                    version,
                    in: [],
                    out: [],
                    return: "TRIGGER",
                    sql,
                };
            },
            plpgsql: (declarations, plpgsql) => {
                if (sql_1.default.is(declarations))
                    plpgsql = declarations, declarations = {};
                return {
                    version,
                    in: [],
                    out: [],
                    return: "TRIGGER",
                    declarations,
                    plpgsql,
                };
            },
        };
    }
    /** @deprecated */
    static legacyFunction(...args) {
        const varsOut = [];
        let returnType = "VOID";
        const factory = {
            out: (...out) => {
                varsOut.push(out);
                return factory;
            },
            returns: returns => {
                returnType = returns;
                return factory;
            },
            get: () => 0,
        };
        return factory;
    }
    static function(version) {
        const varsIn = [];
        const varsOut = [];
        let returnType = "VOID";
        const factory = {
            in: (type, name) => {
                varsIn.push([type, name]);
                return factory;
            },
            out: (...out) => {
                varsOut.push(out);
                return factory;
            },
            returns: returns => {
                returnType = returns;
                return factory;
            },
            sql: (sql) => ({
                version,
                in: varsIn,
                out: varsOut,
                return: returnType,
                sql,
            }),
            plpgsql: (declarations, plpgsql) => {
                if (sql_1.default.is(declarations))
                    plpgsql = declarations, declarations = {};
                return {
                    version,
                    in: varsIn,
                    out: varsOut,
                    return: returnType,
                    declarations,
                    plpgsql,
                };
            },
        };
        return factory;
    }
    static primaryKey(...keys) {
        return keys;
    }
    static optional(type) {
        return { type, optional: true };
    }
    static getSingleColumnPrimaryKey(schema) {
        const primaryKey = schema["PRIMARY_KEY"];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        // const primaryKey = ?.[0];
        if (!primaryKey || primaryKey.length !== 1)
            throw new Error("No primary key or primary key is multiple columns");
        return primaryKey[0];
    }
    static getPrimaryKey(schema) {
        const primaryKey = schema["PRIMARY_KEY"];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        // const primaryKey = ?.[0];
        if (!primaryKey?.length)
            throw new Error("No primary key");
        return primaryKey;
    }
    static isColumn(schema, column, type) {
        let columnType = schema[column];
        if (!columnType)
            throw new Error(`No column ${String(column)} in schema`);
        if (typeof columnType === "object")
            columnType = columnType.type;
        switch (type) {
            case "TIMESTAMP":
                return columnType.startsWith("TIMESTAMP");
            default:
                return columnType === type;
        }
    }
}
Schema.INDEX = {};
Schema.TRIGGER = {};
/** @deprecated */
Schema.TRIGGER_FUNCTION = { version: "-1", in: [], out: [], return: "TRIGGER", sql: (0, sql_1.default) `` };
Schema.COLLATION = {};
exports.default = Schema;
