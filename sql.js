"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = sql;
const SYMBOL_SQL = Symbol("Sql");
function isSql(value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return typeof value === "object" && !!value && !!value[SYMBOL_SQL];
}
function sql(segments, ...interpolations) {
    if (!interpolations.length)
        return { text: segments[0] };
    const data = [segments, interpolations];
    const result = {
        [SYMBOL_SQL]: data,
        get text() {
            compile(data);
            return this.text;
        },
        get values() {
            compile(data);
            return this.values;
        },
    };
    return result;
    function compile([segments, interpolations]) {
        if (!interpolations.length)
            return { text: segments[0] };
        let resultInterpolations;
        let vi = 1;
        const text = recurse();
        Object.defineProperty(result, "text", { value: text });
        Object.defineProperty(result, "values", { value: resultInterpolations ?? interpolations });
        function recurse(recursiveData) {
            if (recursiveData?.[1].length)
                resultInterpolations = data[1].slice();
            const [segments, interpolations] = recursiveData ?? data;
            let text = segments[0];
            for (let i = 0; i < interpolations.length; i++) {
                const interpolation = interpolations[i];
                if (isSql(interpolation)) {
                    text += recurse(interpolation[SYMBOL_SQL]);
                    continue;
                }
                resultInterpolations?.push(interpolation);
                text += `$${vi++}${segments[i + 1]}`;
            }
            return text;
        }
    }
}
