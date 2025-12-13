"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualTable_1 = require("../VirtualTable");
const Expression_1 = __importDefault(require("../expressions/Expression"));
var JoinType;
(function (JoinType) {
    JoinType[JoinType["Inner"] = 0] = "Inner";
    JoinType[JoinType["Left Outer"] = 1] = "Left Outer";
    JoinType[JoinType["Full Outer"] = 2] = "Full Outer";
    JoinType[JoinType["Right Outer"] = 3] = "Right Outer";
})(JoinType || (JoinType = {}));
class Join extends VirtualTable_1.VirtualTable {
    constructor(type, table1, table2, alias1, alias2, vars) {
        super(`vt_join_${typeof table1 === 'string' ? table1 : table1.name}_${table2}`, vars);
        this.type = type;
        this.table1 = table1;
        this.table2 = table2;
        this.alias1 = alias1;
        this.alias2 = alias2;
    }
    on(initialiser) {
        const queryable = Expression_1.default.compile(initialiser, undefined, this.vars);
        this.condition = `ON (${queryable.text})`;
        return this;
    }
    innerJoin(tableName, alias) {
        return new Join('INNER', this, tableName, undefined, alias, this.vars);
    }
    leftOuterJoin(tableName, alias) {
        return new Join('LEFT OUTER', this, tableName, undefined, alias, this.vars);
    }
    rightOuterJoin(tableName, alias) {
        return new Join('RIGHT OUTER', this, tableName, undefined, alias, this.vars);
    }
    fullOuterJoin(tableName, alias) {
        return new Join('FULL OUTER', this, tableName, undefined, alias, this.vars);
    }
    compileFrom() {
        if (this.type !== 'INNER' && !this.condition)
            throw new Error(`Unable to join ${typeof this.table1 === 'string' ? this.table1 : '(joined table)'} and ${this.table2}, no ON expression provided`);
        const type = this.type === 'INNER' && !this.condition ? 'CROSS' : this.type;
        const table1 = typeof this.table1 === 'string' ? `${this.table1 ?? ''} ${this.alias1 ?? ''}`
            : this.table1.compileFrom();
        return `${table1} ${type} JOIN ${this.table2} ${this.alias2 ?? ''} ${this.condition ?? ''}`;
    }
}
exports.default = Join;
