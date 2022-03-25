import { ExpressionInitialiser } from "../../expressions/Expression";
import Statement from "../Statement";
export default class CreateIndex<NAME extends string, SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {
    readonly name: NAME;
    readonly on: string;
    private isUnique;
    private readonly columns;
    private readonly valid;
    constructor(name: NAME, on: string);
    unique(): this;
    column<COLUMN extends keyof SCHEMA & string>(column: COLUMN): CreateIndex<NAME, SCHEMA, true>;
    expression(initialiser: ExpressionInitialiser<SCHEMA, any>): CreateIndex<NAME, SCHEMA, true>;
    compile(): string;
}
