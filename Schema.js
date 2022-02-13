"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
function Schema(schema) {
    return schema;
}
exports.Schema = Schema;
(function (Schema) {
    function primaryKey(...keys) {
        return keys;
    }
    Schema.primaryKey = primaryKey;
    function table(schema) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema;
    }
    Schema.table = table;
})(Schema = exports.Schema || (exports.Schema = {}));
