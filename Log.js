"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = color;
function log(prefix, text) {
    if (!process.env.DEBUG_PG)
        return;
    if (text === undefined)
        text = prefix, prefix = "";
    // prefix = prefix ? prefix.slice(0, 20).trimEnd() + " " : prefix; // cap prefix length at 20
    const maxLineLength = 150 - prefix.length;
    text = text.split("\n")
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
        .map((line, i) => i ? line.padStart(line.length + prefix.length, " ") : `${prefix}${line}`)
        .join("\n");
    console.log(text);
}
exports.default = log;
let ansicolor;
function color(color, text) {
    if (!ansicolor) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            ansicolor = require("ansicolor");
            // eslint-disable-next-line no-empty
        }
        catch { }
        if (!ansicolor)
            return text;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return ansicolor[color](text);
}
