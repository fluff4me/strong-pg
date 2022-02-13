import { Initialiser, Merge2, TypeString } from "../../IStrongPG";
import { Schema } from "../../Schema";
import Transaction from "../../Transaction";

export namespace TableMigration {
	export type Operation = string;

	export namespace Operation {
		export type ColumnAdd<COLUMN extends string, TYPE extends TypeString> =
			`ADD COLUMN ${COLUMN} ${TYPE}`;

		export type ColumnRemove<COLUMN extends string> =
			`DROP COLUMN ${COLUMN}`;

		export type ColumnRename<COLUMN extends string, NAME_NEW extends string> =
			`RENAME COLUMN ${COLUMN} TO ${NAME_NEW}`;

		export type AddPrimaryKey =
			`ADD CONSTRAINT table_pkey PRIMARY KEY (${string})`;

		export type DropPrimaryKey =
			"DROP CONSTRAINT table_pkey";
	}
}

export default class AlterTable<SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : Exclude<SCHEMA_START, null>> extends Transaction {

	private schemaStart!: SCHEMA_START;
	private schemaEnd!: SCHEMA_END;

	public constructor (public readonly table: string) {
		super();
	}

	public readonly operations: TableMigration.Operation[] = [];
	public readonly standaloneOperations: TableMigration.Operation[] = [];

	private do<OPERATION extends TableMigration.Operation, SCHEMA_NEW> (operation: OPERATION) {
		this.operations.push(operation);
		return this as any as AlterTable<SCHEMA_START, SCHEMA_NEW>;
	}

	private doStandalone<OPERATION extends TableMigration.Operation, SCHEMA_NEW> (operation: OPERATION) {
		this.standaloneOperations.push(operation);
		return this as any as AlterTable<SCHEMA_START, SCHEMA_NEW>;
	}

	public addColumn<NAME extends string, TYPE extends TypeString> (name: NAME, type: TYPE, initialiser?: Initialiser<ColumnAddition<NAME, TYPE>>) {
		const column = new ColumnAddition(name, type);
		initialiser?.(column);

		return this.do<TableMigration.Operation.ColumnAdd<NAME, TYPE>, Merge2<SCHEMA_END, { [KEY in NAME]: TYPE }>>(
			`ADD COLUMN ${name} ${type}`);
	}

	public dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string> (name: NAME) {
		return this.do<TableMigration.Operation.ColumnRemove<NAME & string>, Pick<SCHEMA_END, Exclude<keyof SCHEMA_END, NAME>>>(
			`DROP COLUMN ${name}`);
	}

	public renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string> (name: NAME, newName: NAME_NEW) {
		return this.doStandalone<TableMigration.Operation.ColumnRename<NAME, NAME_NEW>, Merge2<Pick<SCHEMA_END, Exclude<keyof SCHEMA_END, NAME>>, { [KEY in NAME_NEW]: SCHEMA_END[NAME] }>>(
			`RENAME COLUMN ${name} TO ${newName}`);
	}

	public addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]> (...keys: KEYS) {
		return this.do<TableMigration.Operation.AddPrimaryKey, Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>(
			`ADD CONSTRAINT table_pkey PRIMARY KEY (${keys.join(",")})`);
	}

	public dropPrimaryKey () {
		return this.do<TableMigration.Operation.DropPrimaryKey, Schema.DropPrimaryKey<SCHEMA_END>>(
			"DROP CONSTRAINT table_pkey");
	}

	public renameTo (newName: string) {
		this.standaloneOperations.push(`RENAME TO ${newName}`);
		return this;
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (): SCHEMA_END extends SCHEMA_TEST ? AlterTable<SCHEMA_START, SCHEMA_TEST> : null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public override compile () {
		return [this.operations.join(","), ...this.standaloneOperations]
			.map(operation => `ALTER TABLE ${this.table} ${operation}`)
			.join(";");
	}
}

export class ColumnReference<TYPE extends TypeString> {
	public constructor (public readonly table: string, public readonly column: string) {
	}
}

export class ColumnAddition<NAME extends string, TYPE extends TypeString> {

	public constructor (public name: NAME, public type: TYPE) {

	}

	public reference?: ColumnReference<TYPE>;

	public setReferences (reference: ColumnReference<TYPE>) {
		this.reference = reference;
		return this;
	}
}
