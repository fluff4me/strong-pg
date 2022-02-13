export function Schema(schema) {
    return schema;
}
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
})(Schema || (Schema = {}));
