"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = sql;
function sql(segments, ...interpolations) {
    let text = segments[0];
    for (let i = 0; i < interpolations.length; i++)
        text += `$${i + 1}${segments[i + 1]}`;
    return { text, values: interpolations };
}
