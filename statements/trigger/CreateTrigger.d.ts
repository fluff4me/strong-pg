import { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Schema from "../../Schema";
import Statement from "../Statement";
export declare class TriggerEvents<SCHEMA extends Record<string, any>, VALID extends boolean = false> {
    private readonly valid;
    private events;
    or: this;
    get insert(): TriggerEvents<SCHEMA, true>;
    update(...columns: Schema.Column<SCHEMA>[]): TriggerEvents<SCHEMA, true>;
    get delete(): TriggerEvents<SCHEMA, true>;
    compile(): string;
}
export type NewAndOldColumns<SCHEMA extends Record<string, any>> = {
    [KEY in keyof SCHEMA as `OLD.${KEY & string}`]: SCHEMA[KEY];
} & {
    [KEY in keyof SCHEMA as `NEW.${KEY & string}`]: SCHEMA[KEY];
};
export type CreateTriggerInitialiser<SCHEMA extends Record<string, any>, FUNCTIONS extends Record<string, any>> = Initialiser<CreateTrigger<SCHEMA, FUNCTIONS>, CreateTrigger<SCHEMA, FUNCTIONS, true, true>>;
export default class CreateTrigger<SCHEMA extends Record<string, any>, FUNCTIONS extends Record<string, any>, HAS_EVENTS extends boolean = false, HAS_PROCEDURE extends boolean = false> extends Statement {
    private readonly id;
    private readonly on;
    protected readonly hasEvents: HAS_EVENTS;
    protected readonly hasProcedure: HAS_PROCEDURE;
    constructor(id: string, on: string);
    private events;
    before(initialiser: Initialiser<TriggerEvents<SCHEMA>, TriggerEvents<SCHEMA, true>>): CreateTrigger<SCHEMA, FUNCTIONS, true, HAS_PROCEDURE>;
    after(initialiser: Initialiser<TriggerEvents<SCHEMA>, TriggerEvents<SCHEMA, true>>): CreateTrigger<SCHEMA, FUNCTIONS, true, HAS_PROCEDURE>;
    private condition?;
    when(initialiser: ExpressionInitialiser<NewAndOldColumns<Schema.Columns<SCHEMA> & {
        "*": "*";
    }>, boolean>): this;
    private fn;
    execute(functionName: keyof FUNCTIONS & string): CreateTrigger<SCHEMA, FUNCTIONS, HAS_EVENTS, true>;
    compile(): Statement.Queryable[];
}
