import { Initialiser, OptionalTypeString, TypeString } from "../../IStrongPG";
import sql from "../../sql";
import Statement from "../Statement";
export type CreateOrReplaceFunctionInitialiser<IN extends (TypeString | OptionalTypeString)[], OUT extends [TypeString, string][], RETURN extends TypeString> = Initialiser<CreateOrReplaceFunction, CreateOrReplaceFunction<true, IN, OUT, RETURN>>;
export default class CreateOrReplaceFunction<HAS_CODE extends boolean = false, IN extends (TypeString | OptionalTypeString)[] = [], OUT extends [TypeString, string][] = [], RETURN extends TypeString = never> extends Statement {
    private readonly name;
    protected readonly hasCode: HAS_CODE;
    private argsIn;
    private argsOut;
    private returnType?;
    private code;
    private lang;
    constructor(name: string);
    in<TYPE extends TypeString | OptionalTypeString>(type: TYPE, name: string): CreateOrReplaceFunction<HAS_CODE, [...IN, TYPE], OUT, RETURN>;
    out<TYPE extends TypeString, NAME extends string>(type: TYPE, name: NAME): CreateOrReplaceFunction<HAS_CODE, IN, [...OUT, [TYPE, NAME]], RETURN>;
    returns<TYPE extends TypeString>(type: TYPE): CreateOrReplaceFunction<HAS_CODE, IN, OUT, TYPE>;
    sql(sql: sql): CreateOrReplaceFunction<true, IN, OUT, RETURN>;
    plpgsql(plpgsql: sql): CreateOrReplaceFunction<true, IN, OUT, RETURN>;
    plpgsql(declarations: Record<string, TypeString>, plpgsql: sql): CreateOrReplaceFunction<true, IN, OUT, RETURN>;
    compile(): Statement.Queryable[];
}
