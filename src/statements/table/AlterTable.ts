import { Initialiser, SetKey, TypeString } from "../../IStrongPG";
import Schema from "../../Schema";
import Statement from "../Statement";

export default class AlterTable<SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<AlterTableSubStatement> {

	private schemaStart!: SCHEMA_START;
	private schemaEnd!: SCHEMA_END;

	public constructor (public readonly table: string) {
		super();
	}

	private do<SCHEMA_NEW> (operation: AlterTableSubStatement) {
		return this.addParallelOperation<AlterTable<SCHEMA_START, SCHEMA_NEW>>(operation);
	}

	private doStandalone<SCHEMA_NEW> (operation: AlterTableSubStatement) {
		return this.addStandaloneOperation<AlterTable<SCHEMA_START, SCHEMA_NEW>>(operation);
	}

	public addColumn<NAME extends string, TYPE extends TypeString> (name: NAME, type: TYPE, alter?: Initialiser<AlterColumn<NAME, TYPE>>) {
		const column = new AlterColumn(name, type);
		alter?.(column);

		return this.do<SetKey<SCHEMA_END, NAME, TYPE>>(
			AlterTableSubStatement.addColumn(name, type));
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

	public renameTo (newName: string) {
		return this.doStandalone(AlterTableSubStatement.renameTo(newName));
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (): SCHEMA_END extends SCHEMA_TEST ? AlterTable<SCHEMA_START, SCHEMA_TEST> : null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	protected compileOperation (operation: string) {
		return `ALTER TABLE ${this.table} ${operation}`;
	}
}

export class ColumnReference<TYPE extends TypeString> {
	public constructor (public readonly table: string, public readonly column: string) {
	}
}

export class AlterColumn<NAME extends string, TYPE extends TypeString> {

	public constructor (public name: NAME, public type: TYPE) {

	}

	public reference?: ColumnReference<TYPE>;

	public setReferences (reference: ColumnReference<TYPE>) {
		this.reference = reference;
		return this;
	}
}

class AlterTableSubStatement extends Statement {
	public static addColumn (column: string, type: TypeString) {
		return new AlterTableSubStatement(`ADD COLUMN ${column} ${type}`);
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

	public static renameTo (newName: string) {
		return new AlterTableSubStatement(`RENAME TO ${newName}`);
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.compiled;
	}
}
