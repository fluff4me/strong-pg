import Statement from "../../Statement";
export default class DropTable<TABLE extends string> extends Statement {
    readonly table: TABLE;
    constructor(table: TABLE);
    compile(): string;
}
