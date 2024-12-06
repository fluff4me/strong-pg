"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Select_1 = require("./statements/Select");
function FunctionCall(name, params) {
    return {
        select: (...columns) => new Select_1.SelectFromVirtualTable(name, columns),
    };
}
exports.default = FunctionCall;
