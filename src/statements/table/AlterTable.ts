import Expression, { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser, SetKey, TypeFromString, TypeString } from "../../IStrongPG";
import Schema from "../../Schema";
import Statement from "../Statement";

export type AlterTableInitialiser<SCHEMA_START, SCHEMA_END> =
	Initialiser<AlterTable<SCHEMA_START>, AlterTable<SCHEMA_START, SCHEMA_END>>;

export default class AlterTable<SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<Statement> {

	protected readonly schemaStart!: SCHEMA_START;
	protected readonly schemaEnd!: SCHEMA_END;

	public constructor (public readonly table: string) {
		super();
	}

	private do<SCHEMA_NEW> (...operations: Statement[]) {
		return this.addParallelOperation<AlterTable<SCHEMA_START, SCHEMA_NEW>>(...operations);
	}

	private doStandalone<SCHEMA_NEW> (...operations: Statement[]) {
		return this.addStandaloneOperation<AlterTable<SCHEMA_START, SCHEMA_NEW>>(...operations);
	}

	public addColumn<NAME extends string, TYPE extends TypeString> (name: NAME, type: TYPE, alter?: Initialiser<AlterColumn<TYPE>>) {
		return this.do<SetKey<SCHEMA_END, NAME, TYPE>>(
			AlterTableSubStatement.addColumn(name, type),
			...alter ? [AlterTableSubStatement.alterColumn<TYPE>(name, alter)] : []);
	}

	public dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string> (name: NAME) {
		return this.do<Omit<SCHEMA_END, NAME>>(
			AlterTableSubStatement.dropColumn(name));
	}

	public renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string> (name: NAME, newName: NAME_NEW) {
		return this.doStandalone<Omit<SCHEMA_END, NAME> & { [KEY in NAME_NEW]: SCHEMA_END[NAME] }>(
			AlterTableSubStatement.renameColumn(name, newName));
	}

	public addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]> (...keys: KEYS) {
		return this.do<Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>(
			AlterTableSubStatement.addPrimaryKey(...keys));
	}

	public dropPrimaryKey () {
		return this.do<Schema.DropPrimaryKey<SCHEMA_END>>(
			AlterTableSubStatement.dropPrimaryKey());
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (): SCHEMA_END extends SCHEMA_TEST ? AlterTable<SCHEMA_START, SCHEMA_TEST> : null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	protected compileOperation (operation: string) {
		return `ALTER TABLE ${this.table} ${operation}`;
	}
}

class AlterTableSubStatement extends Statement {
	public static addColumn (column: string, type: TypeString) {
		return new AlterTableSubStatement(`ADD COLUMN ${column} ${TypeString.resolve(type)}`);
	}

	public static alterColumn<TYPE extends TypeString> (column: string, initialiser: Initialiser<AlterColumn<TYPE>>) {
		const statement = new AlterColumn<TYPE>(column);
		initialiser(statement);
		return statement;
	}

	public static dropColumn (column: string) {
		return new AlterTableSubStatement(`DROP COLUMN ${column}`);
	}

	public static renameColumn (column: string, newName: string) {
		return new AlterTableSubStatement(`RENAME COLUMN ${column} TO ${newName}`);
	}

	public static addPrimaryKey (...keys: string[]) {
		return new AlterTableSubStatement(`ADD CONSTRAINT table_pkey PRIMARY KEY (${keys.join(",")})`);
	}

	public static dropPrimaryKey () {
		return new AlterTableSubStatement("DROP CONSTRAINT table_pkey");
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.compiled;
	}
}

// export class ColumnReference<TYPE extends TypeString> {
// 	public constructor (public readonly table: string, public readonly column: string) {
// 	}
// }

export class AlterColumn<TYPE extends TypeString> extends Statement.Super<AlterColumnSubStatement> {

	public constructor (public name: string) {
		super();
	}

	// public reference?: ColumnReference<TYPE>;

	// public setReferences (reference: ColumnReference<TYPE>) {
	// 	this.reference = reference;
	// 	return this;
	// }

	public default (value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>) {
		return this.addParallelOperation(AlterColumnSubStatement.setDefault(value));
	}

	public notNull () {
		return this.addParallelOperation(AlterColumnSubStatement.setNotNull());
	}

	protected compileOperation (operation: string) {
		return `ALTER COLUMN ${this.name} ${operation}`;
	}
}

class AlterColumnSubStatement extends Statement {
	public static setDefault<TYPE extends TypeString> (value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>) {
		const stringifiedValue = typeof value === "function" ? Expression.stringify(value) : Expression.stringifyValue(value);
		return new AlterColumnSubStatement(`SET DEFAULT (${stringifiedValue})`);
	}

	public static setNotNull () {
		return new AlterColumnSubStatement("SET NOT NULL");
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.compiled;
	}
}
