"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
const Update_1 = __importDefault(require("./Update"));
class InsertIntoTable extends Statement_1.default {
    static columns(tableName, schema, columns, isUpsert = false) {
        return {
            values: (...values) => {
                const query = new InsertIntoTable(tableName, schema, columns, values);
                if (isUpsert) {
                    query.onConflictDoUpdate(update => {
                        for (let i = 0; i < columns.length; i++) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            update.set(columns[i], values[i]);
                        }
                    });
                }
                return query;
            },
        };
    }
    constructor(tableName, schema, columns, values) {
        super();
        this.tableName = tableName;
        this.schema = schema;
        this.columns = columns;
        this.values = values;
        this.vars = [];
    }
    onConflictDoNothing() {
        this.onConflict = null;
        return this;
    }
    onConflictDoUpdate(initialiser) {
        this.onConflict = new Update_1.default(undefined, this.schema, this.vars);
        initialiser(this.onConflict);
        return this;
    }
    compile() {
        const values = this.values.map(value => Expression_1.default.stringifyValue(value, this.vars)).join(",");
        let onConflict = this.onConflict === undefined ? " "
            : this.onConflict === null ? "ON CONFLICT DO NOTHING"
                : undefined;
        if (this.onConflict) {
            const compiled = this.onConflict.compile()[0];
            onConflict = `ON CONFLICT DO ${compiled.text}`;
        }
        return this.queryable(`INSERT INTO ${this.tableName} (${this.columns.join(",")}) VALUES (${values}) ${onConflict}`, undefined, this.vars);
    }
    resolveQueryOutput(output) {
        return output.rows;
    }
}
exports.default = InsertIntoTable;
