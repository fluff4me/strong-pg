import Statement from "../Statement";
export default class DropIndex<NAME extends string> extends Statement {
    readonly name: NAME;
    constructor(name: NAME);
    compile(): string;
}
