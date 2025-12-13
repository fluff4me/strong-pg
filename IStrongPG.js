"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackUtil = exports.GENERATE_UUID = exports.DESC = exports.ASC = exports.BREADTH = exports.DEPTH = exports.CURRENT_TIMESTAMP = exports.TypeString = exports.SYMBOL_COLUMNS = exports.DataType = exports.TimeUnit = exports.DataTypeID = exports.NULLS_NOT_DISTINCT = exports.NULLS_DISTINCT = exports.SET_DEFAULT = exports.SET_NULL = exports.CASCADE = void 0;
exports.Interval = Interval;
const sql_1 = __importDefault(require("./sql"));
exports.CASCADE = Symbol('CASCADE');
exports.SET_NULL = Symbol('SET NULL');
exports.SET_DEFAULT = Symbol('SET DEFAULT');
exports.NULLS_DISTINCT = Symbol('NULLS DISTINCT');
exports.NULLS_NOT_DISTINCT = Symbol('NULLS NOT DISTINCT');
var DataTypeID;
(function (DataTypeID) {
    // numeric
    DataTypeID[DataTypeID["SMALLINT"] = 0] = "SMALLINT";
    DataTypeID[DataTypeID["INTEGER"] = 1] = "INTEGER";
    DataTypeID[DataTypeID["BIGINT"] = 2] = "BIGINT";
    DataTypeID[DataTypeID["NUMERIC"] = 3] = "NUMERIC";
    DataTypeID[DataTypeID["REAL"] = 4] = "REAL";
    DataTypeID[DataTypeID["DOUBLE"] = 5] = "DOUBLE";
    DataTypeID[DataTypeID["SMALLSERIAL"] = 6] = "SMALLSERIAL";
    DataTypeID[DataTypeID["SERIAL"] = 7] = "SERIAL";
    DataTypeID[DataTypeID["BIGSERIAL"] = 8] = "BIGSERIAL";
    // datetime
    DataTypeID[DataTypeID["DATE"] = 9] = "DATE";
    DataTypeID[DataTypeID["TIMESTAMP"] = 10] = "TIMESTAMP";
    DataTypeID[DataTypeID["TIME"] = 11] = "TIME";
    DataTypeID[DataTypeID["INTERVAL"] = 12] = "INTERVAL";
    // string
    DataTypeID[DataTypeID["CHAR"] = 13] = "CHAR";
    DataTypeID[DataTypeID["VARCHAR"] = 14] = "VARCHAR";
    DataTypeID[DataTypeID["BYTECHAR"] = 15] = "BYTECHAR";
    DataTypeID[DataTypeID["BIT"] = 16] = "BIT";
    DataTypeID[DataTypeID["VARBIT"] = 17] = "VARBIT";
    DataTypeID[DataTypeID["TEXT"] = 18] = "TEXT";
    DataTypeID[DataTypeID["ENUM"] = 19] = "ENUM";
    DataTypeID[DataTypeID["UUID"] = 20] = "UUID";
    // other
    DataTypeID[DataTypeID["BOOLEAN"] = 21] = "BOOLEAN";
    // special
    DataTypeID[DataTypeID["TSVECTOR"] = 22] = "TSVECTOR";
    DataTypeID[DataTypeID["JSON"] = 23] = "JSON";
    DataTypeID[DataTypeID["JSONB"] = 24] = "JSONB";
    DataTypeID[DataTypeID["RECORD"] = 25] = "RECORD";
    DataTypeID[DataTypeID["SETOF"] = 26] = "SETOF";
    DataTypeID[DataTypeID["TRIGGER"] = 27] = "TRIGGER";
    DataTypeID[DataTypeID["VOID"] = 28] = "VOID";
    DataTypeID[DataTypeID["ARRAY"] = 29] = "ARRAY";
    DataTypeID[DataTypeID["ARRAYOF"] = 30] = "ARRAYOF";
})(DataTypeID || (exports.DataTypeID = DataTypeID = {}));
var TimeUnitSource;
(function (TimeUnitSource) {
    TimeUnitSource[TimeUnitSource["years"] = 0] = "years";
    TimeUnitSource[TimeUnitSource["months"] = 1] = "months";
    TimeUnitSource[TimeUnitSource["days"] = 2] = "days";
    TimeUnitSource[TimeUnitSource["hours"] = 3] = "hours";
    TimeUnitSource[TimeUnitSource["minutes"] = 4] = "minutes";
    TimeUnitSource[TimeUnitSource["seconds"] = 5] = "seconds";
})(TimeUnitSource || (TimeUnitSource = {}));
var TimeUnit;
(function (TimeUnit) {
    TimeUnit.UNITS = Object.keys(TimeUnitSource).filter(k => isNaN(Number(k)));
    function is(unit) {
        return TimeUnit.UNITS.includes(unit);
    }
    TimeUnit.is = is;
})(TimeUnit || (exports.TimeUnit = TimeUnit = {}));
function Interval(time, unit) {
    if (!Number.isInteger(time) || time < 0)
        throw new TypeError('INTERVAL time must be a non-negative integer');
    if (!TimeUnit.is(unit))
        throw new TypeError(`INTERVAL unit must be one of ${TimeUnit.UNITS.join(', ')}`);
    return sql_1.default.raw(`INTERVAL '${time} ${unit}'`);
}
var DataType;
(function (DataType) {
    // numeric
    DataType.SMALLINT = 'SMALLINT';
    DataType.INTEGER = 'INTEGER';
    DataType.BIGINT = 'BIGINT';
    function NUMERIC(precision, scale) {
        return (precision === undefined ? 'NUMERIC'
            : scale === undefined ? `NUMERIC(${Math.round(precision)})`
                : `NUMERIC(${Math.round(precision)},${Math.round(scale)})`);
    }
    DataType.NUMERIC = NUMERIC;
    DataType.REAL = 'REAL';
    DataType.DOUBLE = 'DOUBLE PRECISION';
    DataType.SMALLSERIAL = 'SMALLSERIAL';
    DataType.SERIAL = 'SERIAL';
    DataType.BIGSERIAL = 'BIGSERIAL';
    // datetime
    DataType.DATE = 'DATE';
    function TIMESTAMP(precision, withoutTimeZone) {
        const timeZone = withoutTimeZone ? ' WITHOUT TIME ZONE' : '';
        return (precision ? `TIMESTAMP(${Math.round(precision)})${timeZone}` : `TIMESTAMP${timeZone}`);
    }
    DataType.TIMESTAMP = TIMESTAMP;
    function TIME(precision, withoutTimeZone) {
        const timeZone = withoutTimeZone ? ' WITHOUT TIME ZONE' : '';
        return (precision ? `TIME(${Math.round(precision)})${timeZone}` : `TIME${timeZone}`);
    }
    DataType.TIME = TIME;
    DataType.INTERVAL = 'INTERVAL';
    // string
    function CHAR(length) {
        return length === undefined ? 'CHARACTER'
            : `CHARACTER(${Math.round(length)})`;
    }
    DataType.CHAR = CHAR;
    function VARCHAR(length) {
        return length === undefined ? 'CHARACTER VARYING'
            : `CHARACTER VARYING(${Math.round(length)})`;
    }
    DataType.VARCHAR = VARCHAR;
    DataType.BYTECHAR = '"char"';
    function BIT(length) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return `BIT(${Math.round(length)})`;
    }
    DataType.BIT = BIT;
    function VARBIT(length) {
        return length === undefined ? 'BIT VARYING'
            : `BIT VARYING(${Math.round(length)})`;
    }
    DataType.VARBIT = VARBIT;
    DataType.TEXT = 'TEXT';
    function ENUM(name) {
        return `ENUM(${name})`;
    }
    DataType.ENUM = ENUM;
    DataType.UUID = 'UUID';
    // other
    DataType.BOOLEAN = 'BOOLEAN';
    // special
    DataType.TSVECTOR = 'TSVECTOR';
    DataType.JSON = 'JSON';
    DataType.JSONB = 'JSONB';
    DataType.RECORD = 'RECORD';
    DataType.TRIGGER = 'TRIGGER';
    DataType.VOID = 'VOID';
    function SETOF(tablename) {
        return `SETOF ${tablename}`;
    }
    DataType.SETOF = SETOF;
    function ARRAY(type) {
        return `${type}[]`;
    }
    DataType.ARRAY = ARRAY;
    function ARRAYOF(type) {
        return `${type}[]`;
    }
    DataType.ARRAYOF = ARRAYOF;
})(DataType || (exports.DataType = DataType = {}));
exports.SYMBOL_COLUMNS = Symbol('COLUMNS');
var TypeString;
(function (TypeString) {
    function resolve(typeString) {
        if (typeof typeString === 'object')
            typeString = typeString.type;
        if (typeString.startsWith('ENUM('))
            return typeString.endsWith('[]')
                ? `${typeString.slice(5, -3)}[]`
                : typeString.slice(5, -1);
        return typeString;
    }
    TypeString.resolve = resolve;
})(TypeString || (exports.TypeString = TypeString = {}));
exports.CURRENT_TIMESTAMP = Symbol('CURRENT_TIMESTAMP AT TIME ZONE \'UTC\'');
exports.DEPTH = Symbol('DEPTH');
exports.BREADTH = Symbol('BREADTH');
exports.ASC = Symbol('ASC');
exports.DESC = Symbol('DESC');
exports.GENERATE_UUID = Symbol('gen_random_uuid()');
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
var StackUtil;
(function (StackUtil) {
    function get(skip = 0) {
        skip += 2;
        const originalFunc = Error.prepareStackTrace;
        // capture stack trace
        Error.prepareStackTrace = function (err, stack) { return stack; };
        const err = new Error();
        const stack = err.stack;
        Error.prepareStackTrace = originalFunc;
        stack.baseFormat = new Error().stack;
        const lines = stack.baseFormat.split('\n');
        for (let i = 1; i < lines.length; i++)
            stack[i - 1].baseFormat = lines[i].trimStart();
        let currentSite = stack.shift();
        while (stack.length) {
            const callerSite = stack.shift();
            if (currentSite?.getFileName() !== callerSite?.getFileName()) {
                skip--;
                currentSite = callerSite;
                if (skip <= 0) {
                    if (callerSite)
                        stack.unshift(callerSite);
                    break;
                }
            }
        }
        for (const callSite of stack) {
            callSite.getAbsoluteFileName = callSite.getFileName;
            Object.defineProperty(callSite, 'getFileName', {
                value() {
                    const basenameRegex = /(?<=\()[^)]+(?=:\d+:\d+\))/;
                    const originalFile = callSite.baseFormat.match(basenameRegex)?.[0];
                    let callerFile = originalFile ?? callSite.getAbsoluteFileName() ?? undefined;
                    if (callerFile?.startsWith('internal/'))
                        return callerFile;
                    let path;
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        path = require('path');
                        callerFile = callerFile && path?.relative(process.env.DEBUG_PG_ROOT_DIR || process.cwd(), callerFile);
                    }
                    catch { }
                    return callerFile ?? null;
                },
            });
            const originalGetLineNumber = callSite.getLineNumber;
            Object.defineProperty(callSite, 'getLineNumber', {
                value() {
                    const lineNumberRegex = /(?<=[(\\/][^\\/)]+:)\d+(?=[):])/;
                    const baseLineNumber = callSite.baseFormat.match(lineNumberRegex)?.[0];
                    const result = +(baseLineNumber ?? originalGetLineNumber.call(callSite) ?? -1);
                    return result === -1 ? undefined : result;
                },
            });
            const originalGetColumnNumber = callSite.getColumnNumber;
            Object.defineProperty(callSite, 'getColumnNumber', {
                value() {
                    const columnNumberRegex = /(?<=[(\\/][^\\/)]+:\d+:)\d+(?=\))/;
                    const baseColumnNumber = callSite.baseFormat.match(columnNumberRegex)?.[0];
                    const result = +(baseColumnNumber ?? originalGetColumnNumber.call(callSite) ?? -1);
                    return result === -1 ? undefined : result;
                },
            });
            callSite.format = () => {
                const typeName = callSite.getTypeName();
                const methodName = callSite.getMethodName();
                const functionName = callSite.getFunctionName();
                const callName = methodName ?? functionName ?? '<anonymous>';
                let qualifiedCallName = typeName && (methodName || !functionName) ? `${typeName}.${callName}` : callName;
                if (typeName && functionName && methodName && methodName !== functionName && !functionName.startsWith(typeName))
                    qualifiedCallName = `${typeName}.${functionName}${functionName.endsWith(methodName) ? '' : color('darkGray', ` [as ${color('lightGray', methodName)}]`)}`;
                const asyncModifier = callSite.isAsync() ? 'async ' : '';
                const constructorModifier = callSite.isConstructor() ? 'new ' : '';
                const evalModifier = callSite.isEval() ? color('lightRed', 'eval ') : '';
                const fileName = callSite.getFileName();
                const lineNumber = callSite.getLineNumber();
                const columnNumber = callSite.getColumnNumber();
                const location = color('lightBlue', fileName ? `${fileName}:${lineNumber}:${columnNumber}` : '<anonymous>');
                return `${evalModifier}${color('darkGray', 'at')} ${asyncModifier}${constructorModifier}${qualifiedCallName} ${color('darkGray', `(${location})`)}`;
            };
        }
        stack.format = (indent = '    ') => stack
            .map(callSite => `${indent}${callSite.format()}`)
            .join('\n');
        return stack;
    }
    StackUtil.get = get;
    function getCallerFile(skip) {
        return get(skip)?.[0].getFileName() ?? undefined;
    }
    StackUtil.getCallerFile = getCallerFile;
})(StackUtil || (exports.StackUtil = StackUtil = {}));
