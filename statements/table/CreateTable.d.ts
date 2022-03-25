import Statement from "../Statement";
export default class CreateTable<TABLE extends string> extends Statement {
    readonly table: TABLE;
    constructor(table: TABLE);
    compile(): string;
}
