import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";
export type CreateOrReplaceFunctionInitialiser = Initialiser<CreateOrReplaceFunction, CreateOrReplaceFunction<true>>;
export default class CreateOrReplaceFunction<HAS_CODE extends boolean = false>/*<IN extends [TypeString, string?][], INOUT extends [TypeString, string?][], OUT extends [TypeString, string?][]>*/  extends Statement {
    private readonly name;
    protected readonly hasCode: HAS_CODE;
    private code;
    private lang;
    constructor(name: string);
    sql(sql: string): CreateOrReplaceFunction<true>;
    plpgsql(plpgsql: string): CreateOrReplaceFunction<true>;
    plpgsql(declarations: Record<string, string>, plpgsql: string): CreateOrReplaceFunction<true>;
    compile(): Statement.Queryable[];
}
