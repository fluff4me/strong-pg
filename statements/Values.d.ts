import { InputTypeFromString, TypeString } from "../IStrongPG";
import sql from "../sql";
export default class Values<NAME extends string, COLUMNS extends readonly string[], TYPES extends readonly TypeString[] = never> {
    private readonly name;
    private readonly columns;
    private data;
    private typeStrings;
    constructor(name: NAME, columns: COLUMNS);
    types<NEW_TYPES extends ([TYPES] extends [never] ? any[] & {
        length: COLUMNS["length"];
    } : TYPES)>(...types: NEW_TYPES): Values<NAME, COLUMNS, readonly [...NEW_TYPES]>;
    values(...rows: {
        [INDEX in keyof TYPES]: InputTypeFromString<TYPES[INDEX]>;
    }[]): Values<NAME, COLUMNS, TYPES>;
    compile(): sql;
}
