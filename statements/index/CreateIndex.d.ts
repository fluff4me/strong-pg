import { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";
export type CreateIndexInitialiser<SCHEMA extends Record<string, any>> = Initialiser<CreateIndex<SCHEMA>, CreateIndex<SCHEMA, true>>;
export default class CreateIndex<SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {
    readonly name: string;
    readonly on: string;
    private isUnique;
    private isNullNotUnique;
    private readonly columns;
    protected readonly valid: COLUMNS;
    constructor(name: string, on: string);
    unique(): this;
    column<COLUMN extends keyof SCHEMA & string>(column: COLUMN): CreateIndex<SCHEMA, true>;
    expression(initialiser: ExpressionInitialiser<SCHEMA, any>): CreateIndex<SCHEMA, true>;
    nullNotUnique(): this;
    compile(): Statement.Queryable[];
}
