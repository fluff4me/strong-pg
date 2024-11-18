import Expression, { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser } from "../../IStrongPG";
import Schema from "../../Schema";
import Statement from "../Statement";

enum TriggerEvent {
	Insert = "INSERT",
	Update = "UPDATE",
	Delete = "DELETE",
}

export class TriggerEvents<SCHEMA extends Record<string, any>, VALID extends boolean = false> {

	private readonly valid!: VALID;
	private events: (TriggerEvent | [TriggerEvent.Update, ...Schema.Column<SCHEMA>[]])[] = [];

	public or = this;

	public get insert (): TriggerEvents<SCHEMA, true> {
		this.events.push(TriggerEvent.Insert);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public update (...columns: Schema.Column<SCHEMA>[]): TriggerEvents<SCHEMA, true> {
		this.events.push(columns.length ? [TriggerEvent.Update, ...columns] : TriggerEvent.Update);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public get delete (): TriggerEvents<SCHEMA, true> {
		this.events.push(TriggerEvent.Delete);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		return this.events.map(event => {
			if (typeof event === "string")
				return event;

			let columns: Schema.Column<SCHEMA>[];
			[event, ...columns] = event;
			return `${event} OF ${columns.join(", ")}`;
		})
			.join(" OR ");
	}
}

export type NewAndOldColumns<SCHEMA extends Record<string, any>> =
	{ [KEY in keyof SCHEMA as `OLD.${KEY & string}`]: SCHEMA[KEY] } & { [KEY in keyof SCHEMA as `NEW.${KEY & string}`]: SCHEMA[KEY] };

export type CreateTriggerInitialiser<SCHEMA extends Record<string, any>, FUNCTIONS extends Record<string, any>> =
	Initialiser<CreateTrigger<SCHEMA, FUNCTIONS>, CreateTrigger<SCHEMA, FUNCTIONS, true, true>>;

export default class CreateTrigger<SCHEMA extends Record<string, any>, FUNCTIONS extends Record<string, any>, HAS_EVENTS extends boolean = false, HAS_PROCEDURE extends boolean = false> extends Statement {

	protected readonly hasEvents!: HAS_EVENTS;
	protected readonly hasProcedure!: HAS_PROCEDURE;
	public constructor (private readonly id: string, private readonly on: string) {
		super();
	}

	private events!: string;
	public before (initialiser: Initialiser<TriggerEvents<SCHEMA>, TriggerEvents<SCHEMA, true>>): CreateTrigger<SCHEMA, FUNCTIONS, true, HAS_PROCEDURE> {
		this.events = `BEFORE ${initialiser(new TriggerEvents()).compile()}`;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public after (initialiser: Initialiser<TriggerEvents<SCHEMA>, TriggerEvents<SCHEMA, true>>): CreateTrigger<SCHEMA, FUNCTIONS, true, HAS_PROCEDURE> {
		this.events = `AFTER ${initialiser(new TriggerEvents()).compile()}`;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	private condition?: string;
	public when (initialiser: ExpressionInitialiser<NewAndOldColumns<Schema.Columns<SCHEMA> & { "*": "*" }>, boolean>) {
		const expr = Expression.compile(initialiser, true);
		this.condition = `WHEN (${expr.text})`;
		return this;
	}

	private fn!: keyof FUNCTIONS & string;
	public execute (functionName: keyof FUNCTIONS & string): CreateTrigger<SCHEMA, FUNCTIONS, HAS_EVENTS, true> {
		this.fn = functionName;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public compile () {
		return this.queryable(`CREATE OR REPLACE TRIGGER ${this.id} ${this.events} ON ${this.on} FOR EACH ROW ${this.condition ?? ""} EXECUTE FUNCTION ${this.fn}()`);
	}
}
