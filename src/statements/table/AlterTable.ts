import Expression, { ExpressionInitialiser } from "../../expressions/Expression";
import { Initialiser, TypeFromString, TypeString } from "../../IStrongPG";
import Schema, { DatabaseSchema } from "../../Schema";
import Statement from "../Statement";

export type AlterTableInitialiser<DB extends DatabaseSchema, SCHEMA_START, SCHEMA_END> =
	Initialiser<AlterTable<DB, SCHEMA_START>, AlterTable<DB, SCHEMA_START, SCHEMA_END>>;

export default class AlterTable<DB extends DatabaseSchema, SCHEMA_START = null, SCHEMA_END = SCHEMA_START extends null ? {} : SCHEMA_START> extends Statement.Super<Statement> {

	protected readonly schemaStart!: SCHEMA_START;
	protected readonly schemaEnd!: SCHEMA_END;

	public constructor (public readonly table: string) {
		super();
	}

	private do<SCHEMA_NEW = SCHEMA_END> (...operations: Statement[]) {
		return this.addParallelOperation<AlterTable<DB, SCHEMA_START, SCHEMA_NEW>>(...operations);
	}

	private doStandalone<SCHEMA_NEW = SCHEMA_END> (...operations: Statement[]) {
		return this.addStandaloneOperation<AlterTable<DB, SCHEMA_START, SCHEMA_NEW>>(...operations);
	}

	public addColumn<NAME extends string, TYPE extends TypeString> (name: NAME, type: TYPE, initialiser?: Initialiser<CreateColumn<DB, TYPE>>) {
		return this.do<{ [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? TYPE : SCHEMA_END[KEY & keyof SCHEMA_END] }>(AlterTableSubStatement.addColumn(name, type, initialiser));
	}

	public dropColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string> (name: NAME) {
		return this.do<Omit<SCHEMA_END, NAME>>(
			AlterTableSubStatement.dropColumn(name));
	}

	public renameColumn<NAME extends SCHEMA_END extends null ? never : keyof SCHEMA_END & string, NAME_NEW extends string> (name: NAME, newName: NAME_NEW) {
		return this.doStandalone<{ [KEY in NAME_NEW | Exclude<keyof SCHEMA_END, NAME>]: KEY extends NAME_NEW ? SCHEMA_END[NAME] : SCHEMA_END[KEY & keyof SCHEMA_END] }>(
			AlterTableSubStatement.renameColumn(name, newName));
	}

	public addPrimaryKey<KEYS extends Schema.PrimaryKeyOrNull<SCHEMA_END> extends null ? (keyof SCHEMA_END & string)[] : never[]> (...keys: KEYS) {
		return this.do<Schema.PrimaryKeyed<SCHEMA_END, KEYS[number][]>>(
			AlterTableSubStatement.addPrimaryKey(this.table, ...keys));
	}

	public dropPrimaryKey () {
		return this.do<Schema.DropPrimaryKey<SCHEMA_END>>(
			AlterTableSubStatement.dropPrimaryKey(this.table));
	}

	public check (id: string, value: ExpressionInitialiser<Schema.Columns<SCHEMA_END>, boolean>) {
		return this.do(AlterTableSubStatement.addCheck(id, value));
	}

	public foreignKey<COLUMN extends Schema.Column<SCHEMA_END>, FOREIGN_TABLE extends DatabaseSchema.TableName<DB>, FOREIGN_KEY extends Schema.ColumnTyped<DatabaseSchema.Table<DB, FOREIGN_TABLE>, SCHEMA_END[COLUMN]>> (column: COLUMN, foreignTable: FOREIGN_TABLE, foreignKey: FOREIGN_KEY) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return this.do(AlterTableSubStatement.addForeignKey(column as string, foreignTable, foreignKey as any));
	}

	public unique (name: string, index: DatabaseSchema.IndexName<DB>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return this.do(AlterTableSubStatement.addUnique(name, index));
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (): SCHEMA_END extends SCHEMA_TEST ? AlterTable<DB, SCHEMA_START, SCHEMA_TEST> : null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	protected compileOperation (operation: string) {
		return `ALTER TABLE ${this.table} ${operation}`;
	}
}

class AlterTableSubStatement extends Statement {
	public static addColumn<NAME extends string, TYPE extends TypeString> (column: NAME, type: TYPE, initialiser?: Initialiser<CreateColumn<any, TYPE>>) {
		const createColumn = new CreateColumn<any, TYPE>();
		initialiser?.(createColumn);
		const columnStuffs = !initialiser ? "" : ` ${createColumn.compile().map(query => query.text).join(" ")}`;
		return new AlterTableSubStatement(`ADD COLUMN ${column} ${TypeString.resolve(type)}${columnStuffs}`);
	}

	public static alterColumn<COLUMN extends string, TYPE extends TypeString> (column: COLUMN, initialiser: Initialiser<AlterColumn<COLUMN, TYPE>>) {
		const statement = new AlterColumn<COLUMN, TYPE>(column);
		initialiser(statement);
		return statement;
	}

	public static dropColumn (column: string) {
		return new AlterTableSubStatement(`DROP COLUMN ${column}`);
	}

	public static renameColumn (column: string, newName: string) {
		return new AlterTableSubStatement(`RENAME COLUMN ${column} TO ${newName}`);
	}

	public static addPrimaryKey (table: string, ...keys: string[]) {
		return new AlterTableSubStatement(`ADD CONSTRAINT ${table}_pkey PRIMARY KEY (${keys.join(",")})`);
	}

	public static dropPrimaryKey (table: string) {
		return new AlterTableSubStatement(`DROP CONSTRAINT ${table}_pkey`);
	}

	public static addCheck (id: string, value: ExpressionInitialiser<any, boolean>) {
		const stringifiedValue = Expression.stringify(value);
		return new AlterTableSubStatement(`ADD CONSTRAINT ${id}_check CHECK (${stringifiedValue})`);
	}

	public static addForeignKey (column: string, foreignTable: string, foreignColumn: string) {
		return new AlterTableSubStatement(`ADD CONSTRAINT ${column}_fk FOREIGN KEY (${column}) REFERENCES ${foreignTable} (${foreignColumn})`);
	}

	public static addUnique (name: string, index: string) {
		return new AlterTableSubStatement(`ADD CONSTRAINT ${name} UNIQUE USING INDEX ${index}`);
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled);
	}
}

// export class ColumnReference<TYPE extends TypeString> {
// 	public constructor (public readonly table: string, public readonly column: string) {
// 	}
// }

export class CreateColumn<DB extends DatabaseSchema, TYPE extends TypeString> extends Statement.Super<CreateColumnSubStatement> {
	public default (value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>) {
		return this.addStandaloneOperation(CreateColumnSubStatement.setDefault(value));
	}

	public notNull () {
		return this.addStandaloneOperation(CreateColumnSubStatement.setNotNull());
	}

	public collate (collation: DatabaseSchema.CollationName<DB>) {
		// put it first
		return this.standaloneOperations.unshift(CreateColumnSubStatement.setCollation(collation));
	}

	protected compileOperation (operation: string) {
		return operation;
	}
}

class CreateColumnSubStatement extends Statement {
	public static setDefault<TYPE extends TypeString> (value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>) {
		const stringifiedValue = typeof value === "function" ? Expression.stringify(value) : Expression.stringifyValue(value);
		return new CreateColumnSubStatement(`DEFAULT (${stringifiedValue})`);
	}

	public static setNotNull () {
		return new CreateColumnSubStatement("NOT NULL");
	}

	public static setCollation (collation: string) {
		return new CreateColumnSubStatement(`COLLATE ${collation}`);
	}

	private constructor (private readonly compiled: string) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled);
	}
}

export class AlterColumn<NAME extends string, TYPE extends TypeString> extends Statement.Super<AlterColumnSubStatement> {

	public constructor (public name: NAME) {
		super();
	}

	// public reference?: ColumnReference<TYPE>;

	// public setReferences (reference: ColumnReference<TYPE>) {
	// 	this.reference = reference;
	// 	return this;
	// }

	public default (value: TypeFromString<TYPE> | ExpressionInitialiser<{}, TypeFromString<TYPE>>) {
		return this.addStandaloneOperation(AlterColumnSubStatement.setDefault(value));
	}

	public notNull () {
		return this.addStandaloneOperation(AlterColumnSubStatement.setNotNull());
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
		return this.queryable(this.compiled);
	}
}
