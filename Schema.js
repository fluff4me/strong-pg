"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
Schema.FUNCTION = () => undefined;
Schema.COLLATION = {};
exports.default = Schema;
