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
}
Schema.INDEX = {};
Schema.TRIGGER = {};
Schema.FUNCTION = () => undefined;
Schema.COLLATION = {};
exports.default = Schema;
