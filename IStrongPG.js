"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyword = exports.TypeString = exports.SYMBOL_COLUMNS = exports.DataType = exports.DataTypeID = void 0;
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
    // INTERVAL,
    // string
    DataTypeID[DataTypeID["CHAR"] = 12] = "CHAR";
    DataTypeID[DataTypeID["VARCHAR"] = 13] = "VARCHAR";
    DataTypeID[DataTypeID["BYTECHAR"] = 14] = "BYTECHAR";
    DataTypeID[DataTypeID["BIT"] = 15] = "BIT";
    DataTypeID[DataTypeID["VARBIT"] = 16] = "VARBIT";
    DataTypeID[DataTypeID["TEXT"] = 17] = "TEXT";
    DataTypeID[DataTypeID["ENUM"] = 18] = "ENUM";
    // other
    DataTypeID[DataTypeID["BOOLEAN"] = 19] = "BOOLEAN";
    // special
    DataTypeID[DataTypeID["TSVECTOR"] = 20] = "TSVECTOR";
})(DataTypeID = exports.DataTypeID || (exports.DataTypeID = {}));
var DataType;
(function (DataType) {
    // numeric
    DataType.SMALLINT = "SMALLINT";
    DataType.INTEGER = "INTEGER";
    DataType.BIGINT = "BIGINT";
    function NUMERIC(precision, scale) {
        return (precision === undefined ? "NUMERIC"
            : scale === undefined ? `NUMERIC(${Math.round(precision)})`
                : `NUMERIC(${Math.round(precision)},${Math.round(scale)})`);
    }
    DataType.NUMERIC = NUMERIC;
    DataType.REAL = "REAL";
    DataType.DOUBLE = "DOUBLE PRECISION";
    DataType.SMALLSERIAL = "SMALLSERIAL";
    DataType.SERIAL = "SERIAL";
    DataType.BIGSERIAL = "BIGSERIAL";
    // datetime
    DataType.DATE = "DATE";
    function TIMESTAMP(precision, withoutTimeZone) {
        const timeZone = withoutTimeZone ? " WITHOUT TIME ZONE" : "";
        return (precision ? `TIMESTAMP(${Math.round(precision)})${timeZone}` : `TIMESTAMP${timeZone}`);
    }
    DataType.TIMESTAMP = TIMESTAMP;
    function TIME(precision, withoutTimeZone) {
        const timeZone = withoutTimeZone ? " WITHOUT TIME ZONE" : "";
        return (precision ? `TIME(${Math.round(precision)})${timeZone}` : `TIME${timeZone}`);
    }
    DataType.TIME = TIME;
    // INTERVAL,
    // string
    DataType.CHAR = "CHARACTER";
    function VARCHAR(length) {
        return length === undefined ? "CHARACTER VARYING"
            : `CHARACTER VARYING(${Math.round(length)})`;
    }
    DataType.VARCHAR = VARCHAR;
    DataType.BYTECHAR = "\"CHAR\"";
    function BIT(length) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return `BIT(${Math.round(length)})`;
    }
    DataType.BIT = BIT;
    function VARBIT(length) {
        return length === undefined ? "BIT VARYING"
            : `BIT VARYING(${Math.round(length)})`;
    }
    DataType.VARBIT = VARBIT;
    DataType.TEXT = "TEXT";
    function ENUM(name) {
        return `ENUM(${name})`;
    }
    DataType.ENUM = ENUM;
    // other
    DataType.BOOLEAN = "BOOLEAN";
    // special
    DataType.TSVECTOR = "TSVECTOR";
})(DataType = exports.DataType || (exports.DataType = {}));
exports.SYMBOL_COLUMNS = Symbol("COLUMNS");
var TypeString;
(function (TypeString) {
    function resolve(typeString) {
        if (typeString.startsWith("ENUM("))
            return typeString.slice(5, -1);
        return typeString;
    }
    TypeString.resolve = resolve;
})(TypeString = exports.TypeString || (exports.TypeString = {}));
var Keyword;
(function (Keyword) {
    Keyword.CurrentTimestamp = Symbol("CURRENT_TIMESTAMP");
})(Keyword = exports.Keyword || (exports.Keyword = {}));
