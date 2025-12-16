"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = color;
exports.getDatabaseErrorDetails = getDatabaseErrorDetails;
const pg_1 = require("pg");
function log(prefix, text) {
    if (!process.env.DEBUG_PG)
        return;
    if (text === undefined)
        text = prefix, prefix = '';
    // prefix = prefix ? prefix.slice(0, 20).trimEnd() + " " : prefix; // cap prefix length at 20
    const maxLineLength = 150 - prefix.length;
    text = text.split('\n')
        .flatMap(line => {
        const lines = [];
        while (line.length > maxLineLength) {
            lines.push(line.slice(0, maxLineLength));
            line = line.slice(maxLineLength);
        }
        lines.push(line.trimEnd());
        return lines;
    })
        .filter(line => line)
        .map((line, i) => i ? line.padStart(line.length + prefix.length, ' ') : `${prefix}${line}`)
        .join('\n');
    console.log(text);
}
exports.default = log;
let ansicolor;
function color(color, text) {
    if (!ansicolor) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            ansicolor = require('ansicolor');
        }
        catch { }
        if (!ansicolor)
            return text;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return ansicolor[color](text);
}
function isDatabaseError(value) {
    return value instanceof pg_1.DatabaseError
        || (typeof value === 'object' && !!value && 'internalQuery' in value);
}
function getDatabaseErrorDetails(err) {
    if (!isDatabaseError(err))
        return null;
    return {
        message: err.message + (err.detail ? `: ${err.detail}` : ''),
        hint: err.hint,
        position: (() => {
            if (!err.position || !err.internalQuery)
                return undefined;
            let line;
            const start = err.internalQuery.lastIndexOf('\n', +err.position) + 1;
            const previousLine = err.internalQuery.substring(err.internalQuery.lastIndexOf('\n', start - 2) + 1, start - 1).trim();
            const end = err.internalQuery.indexOf('\n', +err.position);
            line = err.internalQuery.substring(start, end);
            const length = line.length;
            line = line.trim();
            const trimmedWhitespace = length - line.length;
            const position = +err.position - start - trimmedWhitespace;
            let result = '';
            if (previousLine)
                result += `  > ${color('darkGray', previousLine)}\n`;
            result += `  > ${line}\n`;
            if (position !== undefined)
                result += `    ${' '.repeat(Math.max(0, position)) + color('red', '^')}`;
            return result;
        })(),
    };
}
