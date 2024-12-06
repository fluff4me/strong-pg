import { Initialiser, TypeString } from "../../IStrongPG";
import Statement from "../Statement";

export type CreateOrReplaceFunctionInitialiser<IN extends TypeString[], OUT extends [TypeString, string][], RETURN extends TypeString> =
	Initialiser<CreateOrReplaceFunction, CreateOrReplaceFunction<true, IN, OUT, RETURN>>;

export type Function<IN extends TypeString[], OUT extends [TypeString, string][], RETURN extends TypeString> =
	(...args: { [I in keyof IN]: IN[I][0] }) => { return: RETURN, out: OUT };

export default class CreateOrReplaceFunction<HAS_CODE extends boolean = false, IN extends TypeString[] = [], OUT extends [TypeString, string][] = [], RETURN extends TypeString = never> extends Statement {

	protected readonly hasCode!: HAS_CODE;
	private argsIn: [TypeString, string][] = [];
	private argsOut: OUT = [] as never;
	private returnType?: RETURN;
	private code!: string;
	private lang!: string;

	public constructor (private readonly name: string) {
		super();
	}

	public in<TYPE extends TypeString> (type: TYPE, name: string): CreateOrReplaceFunction<HAS_CODE, [...IN, TYPE], OUT, RETURN> {
		this.argsIn.push([type, name]);
		return this as never;
	}

	public out<TYPE extends TypeString, NAME extends string> (type: TYPE, name: NAME): CreateOrReplaceFunction<HAS_CODE, IN, [...OUT, [TYPE, NAME]], RETURN> {
		this.argsOut.push([type, name]);
		return this as never;
	}

	public returns<TYPE extends TypeString> (type: TYPE): CreateOrReplaceFunction<HAS_CODE, IN, OUT, TYPE> {
		this.returnType = type as never;
		return this as never;
	}

	public sql (sql: string): CreateOrReplaceFunction<true, IN, OUT, RETURN> {
		this.code = sql;
		this.lang = "SQL";
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public plpgsql (plpgsql: string): CreateOrReplaceFunction<true, IN, OUT, RETURN>;
	public plpgsql (declarations: Record<string, TypeString>, plpgsql: string): CreateOrReplaceFunction<true, IN, OUT, RETURN>;
	public plpgsql (declarations: Record<string, TypeString> | string, plpgsql?: string): CreateOrReplaceFunction<true, IN, OUT, RETURN> {
		if (typeof declarations === "string")
			plpgsql = declarations, declarations = {};

		const declare = Object.entries(declarations).map(([name, type]) => `${name} ${type}`).join(";")

		this.code = `${declare ? `DECLARE ${declare}; ` : ""}BEGIN ${plpgsql!} END`;
		this.lang = "plpgsql";
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		const params = this.argsIn.map(([type, name]) => `${name ?? ""} ${type}`)
			.concat(this.argsOut.map(([type, name]) => `OUT ${name ?? ""} ${type}`))
			.join(", ");
		const out = this.returnType ?? "TRIGGER"
		return this.queryable(`CREATE OR REPLACE FUNCTION ${this.name}(${params}) RETURNS ${out} AS $$ ${this.code} $$ LANGUAGE ${this.lang}`);
	}
}
