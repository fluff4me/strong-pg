import { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";
export type CreateIndexInitialiser<SCHEMA extends Record<string, any>> = Initialiser<CreateIndex<SCHEMA>, CreateIndex<SCHEMA, true>>;
export declare const NULLS_DISTINCT: unique symbol;
export declare const NULLS_NOT_DISTINCT: unique symbol;
export default class CreateIndex<SCHEMA extends Record<string, any>, COLUMNS extends boolean = false> extends Statement {
    readonly name: string;
    readonly on: string;
    private isUnique;
    private readonly columns;
    protected readonly valid: COLUMNS;
    constructor(name: string, on: string);
    unique(option: typeof NULLS_DISTINCT | typeof NULLS_NOT_DISTINCT): this;
    column<COLUMN extends keyof SCHEMA & string>(column: COLUMN): CreateIndex<SCHEMA, true>;
    expression(initialiser: ExpressionInitialiser<SCHEMA, any>): CreateIndex<SCHEMA, true>;
    compile(): Statement.Queryable[];
}
