"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _SQL_instances, _a, _SQL_data, _SQL_compile, _SQL_compileOffset, _SQL_compileRaw;
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const util_1 = __importDefault(require("util"));
const Log_1 = __importStar(require("./Log"));
function isDatabaseError(value) {
    return value instanceof pg_1.DatabaseError
        || (typeof value === 'object' && !!value && 'internalQuery' in value);
}
class SQL {
    constructor(...data) {
        _SQL_instances.add(this);
        _SQL_data.set(this, void 0);
        __classPrivateFieldSet(this, _SQL_data, data, "f");
    }
    get text() {
        __classPrivateFieldGet(this, _SQL_instances, "m", _SQL_compile).call(this);
        return this.text;
    }
    get values() {
        __classPrivateFieldGet(this, _SQL_instances, "m", _SQL_compile).call(this);
        return this.values;
    }
    compile(vars) {
        const { text, values } = __classPrivateFieldGet(this, _SQL_instances, "m", _SQL_compileOffset).call(this, vars.length);
        vars.push(...values ?? []);
        return text;
    }
    async query(pool) {
        try {
            (0, Log_1.default)('  > ', (0, Log_1.color)('darkGray', this.text));
            if (this.values?.length)
                for (let i = 0; i < this.values.length; i++)
                    (0, Log_1.default)(`    ${(0, Log_1.color)('lightYellow', `$${i + 1}`)}${(0, Log_1.color)('darkGray', ':')} `, util_1.default.inspect(this.values[i], undefined, Infinity, true));
            return await pool.query(this);
        }
        catch (err) {
            if (!isDatabaseError(err))
                throw err;
            (0, Log_1.default)((0, Log_1.color)('red', 'Error: ') + err.message + (err.detail ? `: ${err.detail}` : '')
                + (err.hint ? (0, Log_1.color)('darkGray', `\nHint: ${err.hint}`) : ''));
            if (err.position === undefined)
                return;
            let line;
            const start = this.text.lastIndexOf('\n', +err.position) + 1;
            const previousLine = this.text.substring(this.text.lastIndexOf('\n', start - 2) + 1, start - 1).trim();
            const end = this.text.indexOf('\n', +err.position);
            line = this.text.substring(start, end);
            const length = line.length;
            line = line.trim();
            const trimmedWhitespace = length - line.length;
            const position = +err.position - start - trimmedWhitespace;
            if (previousLine)
                (0, Log_1.default)('  > ', (0, Log_1.color)('darkGray', previousLine));
            (0, Log_1.default)('  > ', line);
            if (position !== undefined)
                (0, Log_1.default)('    ', ' '.repeat(Math.max(0, position - 1)) + (0, Log_1.color)('red', '^'));
        }
    }
    /** @deprecated be careful!!! */
    get asRawSql() {
        __classPrivateFieldGet(this, _SQL_instances, "m", _SQL_compileRaw).call(this);
        return this.asRawSql;
    }
}
_a = SQL, _SQL_data = new WeakMap(), _SQL_instances = new WeakSet(), _SQL_compile = function _SQL_compile() {
    const { text, values } = __classPrivateFieldGet(this, _SQL_instances, "m", _SQL_compileOffset).call(this);
    Object.defineProperty(this, 'text', { value: text });
    Object.defineProperty(this, 'values', { value: values });
}, _SQL_compileOffset = function _SQL_compileOffset(vi = 0) {
    const [topLayerSegments, topLayerInterpolations] = __classPrivateFieldGet(this, _SQL_data, "f");
    if (!topLayerInterpolations.length)
        return { text: topLayerSegments[0], values: undefined };
    let resultInterpolations;
    vi++;
    const recurse = (recursiveData) => {
        const [segments, interpolations] = recursiveData ?? __classPrivateFieldGet(this, _SQL_data, "f");
        let text = segments[0];
        for (let i = 0; i < interpolations.length; i++) {
            const interpolation = interpolations[i];
            if (interpolation instanceof _a) {
                const subData = __classPrivateFieldGet(interpolation, _SQL_data, "f");
                if (subData)
                    resultInterpolations ?? (resultInterpolations = topLayerInterpolations.slice(0, i));
                text += recurse(subData);
                text += segments[i + 1];
                continue;
            }
            resultInterpolations?.push(interpolation);
            text += `$${vi++}${segments[i + 1]}`;
        }
        return text;
    };
    const text = recurse();
    return { text, values: resultInterpolations ?? topLayerInterpolations };
}, _SQL_compileRaw = function _SQL_compileRaw() {
    const [topLayerSegments, topLayerInterpolations] = __classPrivateFieldGet(this, _SQL_data, "f");
    if (!topLayerInterpolations.length) {
        Object.defineProperty(this, 'asRawSql', { value: topLayerSegments[0] });
        return;
    }
    const recurse = (recursiveData) => {
        const [segments, interpolations] = recursiveData ?? __classPrivateFieldGet(this, _SQL_data, "f");
        let text = segments[0];
        for (let i = 0; i < interpolations.length; i++) {
            const interpolation = interpolations[i];
            if (interpolation instanceof _a) {
                text += recurse(__classPrivateFieldGet(interpolation, _SQL_data, "f"));
                text += segments[i + 1];
                continue;
            }
            text += `${String(interpolation)}${segments[i + 1]}`;
        }
        return text;
    };
    const text = recurse();
    Object.defineProperty(this, 'asRawSql', { value: text });
};
function sql(segments, ...interpolations) {
    return new SQL(segments, interpolations);
}
(function (sql) {
    function is(value) {
        return value instanceof SQL;
    }
    sql.is = is;
    function join(segments, separator) {
        return segments.reduce((acc, cur) => sql `${acc}${separator}${cur}`);
    }
    sql.join = join;
    function raw(text) {
        return new SQL([text], []);
    }
    sql.raw = raw;
})(sql || (sql = {}));
exports.default = sql;
