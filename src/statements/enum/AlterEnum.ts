import Statement from "../Statement";

type Rename<ENUM extends string[], OLD extends ENUM[number], NEW extends string> = ENUM extends [] ? [] :
	ENUM extends [infer HEAD, ...infer TAIL] ?
	HEAD extends OLD ? TAIL : [HEAD, ...Rename<TAIL & string[], OLD, NEW>] : ENUM;

type AddValueBefore<ENUM extends string[], PIVOT extends ENUM[number], NEW extends string> = ENUM extends [] ? [] :
	ENUM extends [infer HEAD, ...infer TAIL] ?
	HEAD extends PIVOT ? [NEW, PIVOT, ...TAIL] : [HEAD, ...AddValueBefore<TAIL & string[], PIVOT, NEW>] : ENUM;

type AddValueAfter<ENUM extends string[], PIVOT extends ENUM[number], NEW extends string> = ENUM extends [] ? [] :
	ENUM extends [infer HEAD, ...infer TAIL] ?
	HEAD extends PIVOT ? [PIVOT, NEW, ...TAIL] : [HEAD, ...AddValueAfter<TAIL & string[], PIVOT, NEW>] : ENUM;

export default class AlterEnum<NAME extends string, VALUES extends string[]> extends Statement.Super<AlterEnumSubStatement> {

	public constructor (public readonly name: NAME) {
		super();
	}

	public add<NEW_VALUES extends string[]> (...values: NEW_VALUES) {
		return this.do<[...VALUES, ...NEW_VALUES]>(...AlterEnumSubStatement.addValues(...values));
	}

	public addBefore<NEW_VALUE extends string, PIVOT_VALUE extends VALUES[number]> (newValue: NEW_VALUE, pivotValue: PIVOT_VALUE) {
		return this.do<AddValueBefore<VALUES, PIVOT_VALUE, NEW_VALUE>>(AlterEnumSubStatement.addValueBefore(newValue, pivotValue));
	}

	public addAfter<NEW_VALUE extends string, PIVOT_VALUE extends VALUES[number]> (newValue: NEW_VALUE, pivotValue: PIVOT_VALUE) {
		return this.do<AddValueAfter<VALUES, PIVOT_VALUE, NEW_VALUE>>(AlterEnumSubStatement.addValueAfter(newValue, pivotValue));
	}

	public rename<OLD extends VALUES[number], NEW extends string> (value: OLD, newValue: NEW) {
		return this.do<Rename<VALUES, OLD, NEW>>(AlterEnumSubStatement.renameValue(value, newValue));
	}

	private do<NEW_VALUES extends string[]> (...statements: AlterEnumSubStatement[]) {
		return this.addStandaloneOperation<AlterEnum<NAME, NEW_VALUES>>(...statements);
	}

	protected compileOperation (operation: string): string {
		return `ALTER TYPE ${this.name} ${operation}`;
	}
}

class AlterEnumSubStatement extends Statement {
	public static addValues (...values: string[]) {
		return values.map(value => new AlterEnumSubStatement(`ADD VALUE '${value}'`));
	}

	public static renameValue (oldValue: string, newValue: string) {
		return new AlterEnumSubStatement(`RENAME VALUE ${oldValue} TO ${newValue}`);
	}

	public static addValueBefore (newValue: string, pivotValue: string) {
		return new AlterEnumSubStatement(`ADD VALUE ${newValue} BEFORE ${pivotValue}`);
	}

	public static addValueAfter (newValue: string, pivotValue: string) {
		return new AlterEnumSubStatement(`ADD VALUE ${newValue} AFTER ${pivotValue}`);
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.compiled;
	}
}

