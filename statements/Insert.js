"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(require("../Schema"));
const Expression_1 = __importDefault(require("../expressions/Expression"));
const Statement_1 = __importDefault(require("./Statement"));
const Update_1 = __importDefault(require("./Update"));
class InsertIntoTable extends Statement_1.default {
    static columns(tableName, schema, columns, isUpsert = false) {
        const primaryKey = !isUpsert ? undefined : Schema_1.default.getSingleColumnPrimaryKey(schema);
        return {
            values: (...values) => {
                const query = new InsertIntoTable(tableName, schema, columns, values);
                if (isUpsert) {
                    query.onConflict(primaryKey).doUpdate(update => {
                        for (let i = 0; i < columns.length; i++) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                            update.set(columns[i], ((expr) => expr.var(`EXCLUDED.${String(columns[i])}`)));
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
    onConflict(...columns) {
        this.conflictTarget = columns;
        return {
            doNothing: () => {
                this.conflictAction = null;
                return this;
            },
            doUpdate: initialiser => {
                this.conflictAction = new Update_1.default(undefined, this.schema, this.vars);
                initialiser(this.conflictAction);
                return this;
            },
        };
    }
    compile() {
        const values = this.values.map((value, i) => {
            const column = this.columns[i];
            if (Schema_1.default.isColumn(this.schema, column, "TIMESTAMP") && typeof value === "number")
                value = new Date(value);
            return Expression_1.default.stringifyValue(value, this.vars);
        }).join(",");
        const conflictTarget = this.conflictTarget?.length ? `(${this.conflictTarget.join(",")})` : "";
        let conflictAction = this.conflictAction === undefined ? " "
            : this.conflictAction === null ? `ON CONFLICT ${conflictTarget} DO NOTHING`
                : undefined;
        if (this.conflictAction) {
            const compiled = this.conflictAction.compile()[0];
            conflictAction = `ON CONFLICT ${conflictTarget} DO ${compiled.text}`;
        }
        return this.queryable(`INSERT INTO ${this.tableName} (${this.columns.join(",")}) VALUES (${values}) ${conflictAction}`, undefined, this.vars);
    }
    resolveQueryOutput(output) {
        return output.rows;
    }
}
exports.default = InsertIntoTable;
