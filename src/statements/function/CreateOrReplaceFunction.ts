import { Initialiser } from "../../IStrongPG";
import Statement from "../Statement";

export type CreateOrReplaceFunctionInitialiser =
	Initialiser<CreateOrReplaceFunction, CreateOrReplaceFunction<true>>;

export default class CreateOrReplaceFunction<HAS_CODE extends boolean = false>/*<IN extends [TypeString, string?][], INOUT extends [TypeString, string?][], OUT extends [TypeString, string?][]>*/ extends Statement {

	protected readonly hasCode!: HAS_CODE;
	// private argsIn: IN;
	// private argsOut: OUT;
	private code!: string;
	private lang!: string;

	public constructor (private readonly name: string) {
		super();
	}

	// public in<TYPE extends TypeString, NAME extends string | undefined> (type: TYPE, name?: NAME): CreateOrReplaceFunction<[...IN, [TYPE, NAME]], OUT> {
	// 	return this;
	// }

	// public out<TYPE extends TypeString, NAME extends string | undefined> (type: TYPE, name?: NAME): CreateOrReplaceFunction<IN, [...OUT, [TYPE, NAME]]> {
	// 	return this;
	// }

	public sql (sql: string): CreateOrReplaceFunction<true> {
		this.code = sql;
		this.lang = "SQL";
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public plpgsql (plpgsql: string): CreateOrReplaceFunction<true> {
		this.code = plpgsql;
		this.lang = "plpgsql";
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		return this.queryable(`CREATE OR REPLACE FUNCTION ${this.name}() RETURNS trigger AS $$ BEGIN ${this.code} END $$ LANGUAGE ${this.lang}`);
	}
}
