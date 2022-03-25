import Statement from "../Statement";
export default class CreateEnum<NAME extends string> extends Statement {
    readonly name: NAME;
    constructor(name: NAME);
    compile(): string;
}
