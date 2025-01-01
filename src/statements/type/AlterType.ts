import { Initialiser, OptionalTypeString, TypeString } from "../../IStrongPG";
import { DatabaseSchema } from "../../Schema";
import Statement from "../Statement";

export type AlterTypeInitialiser<DB extends DatabaseSchema, SCHEMA_START, SCHEMA_END> =
	Initialiser<AlterType<DB, SCHEMA_START>, AlterType<DB, SCHEMA_START, SCHEMA_END>>;

export default class AlterType<DB extends DatabaseSchema, SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<AlterTypeSubStatement> {
	public constructor (public readonly name: string) {
		super()
	}

	public add<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString = OptionalTypeString<TYPE>> (name: NAME, type: TYPE) {
		return this.do<{ [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END] }>(AlterTypeSubStatement.addAttributes(name, type));
	}

	private do<SCHEMA_NEW = SCHEMA_END> (...operations: AlterTypeSubStatement[]) {
		return this.addParallelOperation<AlterType<DB, SCHEMA_START, SCHEMA_NEW>>(...operations);
	}

	protected compileOperation (operation: string): string {
		return `ALTER TYPE ${this.name} ${operation}`;
	}
}

class AlterTypeSubStatement extends Statement {
	public static addAttributes<NAME extends string, TYPE extends TypeString> (column: NAME, type: TYPE) {
		return new AlterTypeSubStatement(`ADD ATTRIBUTE ${column} ${TypeString.resolve(type)}`);
	}

	public static renameAttribute (oldAttribute: string, newAttribute: string) {
		return new AlterTypeSubStatement(`RENAME ATTRIBUTE ${oldAttribute} TO ${newAttribute}`);
	}

	public static dropAttribute (attribute: string) {
		return new AlterTypeSubStatement(`DROP ATTRIBUTE ${attribute}`);
	}

	public static alterAttribute<NAME extends string, TYPE extends TypeString> (attribute: NAME, type: TYPE) {
		return new AlterTypeSubStatement(`ALTER ATTRIBUTE ${attribute} SET DATA TYPE ${TypeString.resolve(type)}`)
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled);
	}
}