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
exports.Sql = void 0;
exports.sql = sql;
var _;
(function (_) {
    var _Sql_instances, _a, _Sql_data, _Sql_compileRaw, _Sql_compile;
    class Sql {
        constructor(...data) {
            _Sql_instances.add(this);
            _Sql_data.set(this, void 0);
            __classPrivateFieldSet(this, _Sql_data, data, "f");
        }
        get text() {
            __classPrivateFieldGet(this, _Sql_instances, "m", _Sql_compile).call(this);
            return this.text;
        }
        get values() {
            __classPrivateFieldGet(this, _Sql_instances, "m", _Sql_compile).call(this);
            return this.values;
        }
        get asRawSql() {
            __classPrivateFieldGet(this, _Sql_instances, "m", _Sql_compileRaw).call(this);
            return this.asRawSql;
        }
    }
    _a = Sql, _Sql_data = new WeakMap(), _Sql_instances = new WeakSet(), _Sql_compileRaw = function _Sql_compileRaw() {
        const [topLayerSegments, topLayerInterpolations] = __classPrivateFieldGet(this, _Sql_data, "f");
        if (!topLayerInterpolations.length)
            return topLayerSegments[0];
        const recurse = (recursiveData) => {
            const [segments, interpolations] = recursiveData ?? __classPrivateFieldGet(this, _Sql_data, "f");
            let text = segments[0];
            for (let i = 0; i < interpolations.length; i++) {
                const interpolation = interpolations[i];
                if (interpolation instanceof _a) {
                    text += recurse(__classPrivateFieldGet(interpolation, _Sql_data, "f"));
                    continue;
                }
                text += `${String(interpolation)}${segments[i + 1]}`;
            }
            return text;
        };
        const text = recurse();
        Object.defineProperty(this, "asRawSql", { value: text });
    }, _Sql_compile = function _Sql_compile() {
        const [topLayerSegments, topLayerInterpolations] = __classPrivateFieldGet(this, _Sql_data, "f");
        if (!topLayerInterpolations.length)
            return { text: topLayerSegments[0] };
        let resultInterpolations;
        let vi = 1;
        const recurse = (recursiveData) => {
            const [segments, interpolations] = recursiveData ?? __classPrivateFieldGet(this, _Sql_data, "f");
            let text = segments[0];
            for (let i = 0; i < interpolations.length; i++) {
                const interpolation = interpolations[i];
                if (interpolation instanceof _a) {
                    const subData = __classPrivateFieldGet(interpolation, _Sql_data, "f");
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
    };
    _.Sql = Sql;
})(_ || (_ = {}));
var Sql;
(function (Sql) {
    function is(value) {
        return value instanceof _.Sql;
    }
    Sql.is = is;
})(Sql || (exports.Sql = Sql = {}));
function sql(segments, ...interpolations) {
    if (!interpolations.length)
        return { text: segments[0] };
    return new _.Sql(segments, interpolations);
}
