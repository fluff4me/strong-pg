"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQL = void 0;
exports.sql = sql;
var _;
(function (_) {
    var _SQL_instances, _a, _SQL_data, _SQL_compile, _SQL_compileRaw;
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
        get asRawSql() {
            __classPrivateFieldGet(this, _SQL_instances, "m", _SQL_compileRaw).call(this);
            return this.asRawSql;
        }
    }
    _a = SQL, _SQL_data = new WeakMap(), _SQL_instances = new WeakSet(), _SQL_compile = function _SQL_compile() {
        const [topLayerSegments, topLayerInterpolations] = __classPrivateFieldGet(this, _SQL_data, "f");
        if (!topLayerInterpolations.length) {
            Object.defineProperty(this, "text", { value: topLayerSegments[0] });
            Object.defineProperty(this, "values", { value: undefined });
            return;
        }
        let resultInterpolations;
        let vi = 1;
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
                    continue;
                }
                resultInterpolations?.push(interpolation);
                text += `$${vi++}${segments[i + 1]}`;
            }
            return text;
        };
        const text = recurse();
        Object.defineProperty(this, "text", { value: text });
        Object.defineProperty(this, "values", { value: resultInterpolations ?? topLayerInterpolations });
    }, _SQL_compileRaw = function _SQL_compileRaw() {
        const [topLayerSegments, topLayerInterpolations] = __classPrivateFieldGet(this, _SQL_data, "f");
        if (!topLayerInterpolations.length) {
            Object.defineProperty(this, "asRawSql", { value: topLayerSegments[0] });
            return;
        }
        const recurse = (recursiveData) => {
            const [segments, interpolations] = recursiveData ?? __classPrivateFieldGet(this, _SQL_data, "f");
            let text = segments[0];
            for (let i = 0; i < interpolations.length; i++) {
                const interpolation = interpolations[i];
                if (interpolation instanceof _a) {
                    text += recurse(__classPrivateFieldGet(interpolation, _SQL_data, "f"));
                    continue;
                }
                text += `${String(interpolation)}${segments[i + 1]}`;
            }
            return text;
        };
        const text = recurse();
        Object.defineProperty(this, "asRawSql", { value: text });
    };
    _.SQL = SQL;
})(_ || (_ = {}));
var SQL;
(function (SQL) {
    function is(value) {
        return value instanceof _.SQL;
    }
    SQL.is = is;
})(SQL || (exports.SQL = SQL = {}));
function sql(segments, ...interpolations) {
    return new _.SQL(segments, interpolations);
}
