"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualTable = void 0;
const Select_1 = require("./statements/Select");
class VirtualTable {
    constructor(name, vars = []) {
        this.name = name;
        this.vars = vars;
    }
    select(...params) {
        const initialiser = typeof params[params.length - 1] === 'function' ? params.pop() : undefined;
        const input = params.length === 0 ? '*'
            : params.length === 1 && typeof params[0] === 'object' ? params[0]
                : params;
        const query = new Select_1.SelectFromVirtualTable(this, input);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.selectInitialiser?.(query);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return initialiser?.(query) ?? query;
    }
}
exports.VirtualTable = VirtualTable;
