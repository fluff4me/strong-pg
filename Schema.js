"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Schema {
    static database(schema) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema;
    }
    static enum(enm) {
        const result = [];
        for (let i = 0;; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const value = enm[i];
            if (typeof value === "string")
                result.push(value);
            else
                break;
        }
        return result;
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
exports.default = Schema;
