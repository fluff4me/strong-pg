import Expression, { ExpressionInitialiser } from "../../expressions/Expression";
import { ExtractTypeString, Initialiser, MigrationTypeFromString, OptionalTypeString, TypeString } from "../../IStrongPG";
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

	public addColumn<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString = OptionalTypeString<TYPE>> (name: NAME, type: TYPE, initialiser?: Initialiser<CreateColumn<DB, OptionalTypeString<TYPE>>, CreateColumn<DB, NEW_TYPE>>) {
		return this.do<{ [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END] }>(AlterTableSubStatement.addColumn(name, type, initialiser));
	}

	public alterColumn<NAME extends keyof SCHEMA_END & string, NEW_TYPE extends TypeString | OptionalTypeString> (name: NAME, initialiser: Initialiser<AlterColumn<NAME, SCHEMA_END[NAME] & (TypeString | OptionalTypeString)>, AlterColumn<NAME, NEW_TYPE>>) {
		return this.do<{ [KEY in NAME | keyof SCHEMA_END]: KEY extends NAME ? NEW_TYPE : SCHEMA_END[KEY & keyof SCHEMA_END] }>(AlterTableSubStatement.alterColumn(name, initialiser));
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

	public foreignKey<COLUMN extends Schema.Column<SCHEMA_END>, FOREIGN_TABLE extends DatabaseSchema.TableName<DB>, FOREIGN_KEY extends Schema.ColumnTyped<DatabaseSchema.Table<DB, FOREIGN_TABLE>, SCHEMA_END[COLUMN]>> (column: COLUMN, foreignTable: FOREIGN_TABLE, foreignKey: FOREIGN_KEY, cascade?: true) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return this.do(AlterTableSubStatement.addForeignKey(column as string, foreignTable, foreignKey as any, cascade));
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
	public static addColumn<NAME extends string, TYPE extends TypeString, NEW_TYPE extends TypeString | OptionalTypeString> (column: NAME, type: TYPE, initialiser?: Initialiser<CreateColumn<any, OptionalTypeString<TYPE>>, CreateColumn<any, NEW_TYPE>>) {
		const createColumn = new CreateColumn<any, OptionalTypeString<TYPE>>();
		initialiser?.(createColumn);
		const columnStuffs = !initialiser ? "" : ` ${createColumn.compile().map(query => query.text).join(" ")}`;
		return new AlterTableSubStatement(`ADD COLUMN ${column} ${TypeString.resolve(type)}${columnStuffs}`);
	}

	public static alterColumn<COLUMN extends string, TYPE extends TypeString | OptionalTypeString, NEW_TYPE extends TypeString | OptionalTypeString> (column: COLUMN, initialiser: Initialiser<AlterColumn<COLUMN, TYPE>, AlterColumn<COLUMN, NEW_TYPE>>) {
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
		const expr = Expression.compile(value);
		return new AlterTableSubStatement(`ADD CONSTRAINT ${id}_check CHECK (${expr.text})`, expr.values);
	}

	public static addForeignKey (column: string, foreignTable: string, foreignColumn: string, cascade?: true) {
		const cascadeString = !cascade ? "" : "ON DELETE CASCADE";
		return new AlterTableSubStatement(`ADD CONSTRAINT ${column}_fk FOREIGN KEY (${column}) REFERENCES ${foreignTable} (${foreignColumn}) ${cascadeString}`);
	}

	public static addUnique (name: string, index: string) {
		return new AlterTableSubStatement(`ADD CONSTRAINT ${name} UNIQUE USING INDEX ${index}`);
	}

	private constructor (private readonly compiled: string, private readonly vars?: any[]) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled, undefined, this.vars);
	}
}

// export class ColumnReference<TYPE extends TypeString> {
// 	public constructor (public readonly table: string, public readonly column: string) {
// 	}
// }

export class CreateColumn<DB extends DatabaseSchema, TYPE extends TypeString | OptionalTypeString> extends Statement.Super<CreateColumnSubStatement> {
	public default (value: MigrationTypeFromString<TYPE> | ExpressionInitialiser<{}, MigrationTypeFromString<TYPE>>) {
		if (value === null)
			return this;
		else
			return this.addStandaloneOperation(CreateColumnSubStatement.setDefault(value));
	}

	public notNull () {
		return this.addStandaloneOperation<CreateColumn<DB, ExtractTypeString<TYPE>>>(CreateColumnSubStatement.setNotNull());
	}

	public collate (collation: DatabaseSchema.CollationName<DB>) {
		// put it first
		this.standaloneOperations.unshift(CreateColumnSubStatement.setCollation(collation));
		return this;
	}

	protected compileOperation (operation: string) {
		return operation;
	}
}

class CreateColumnSubStatement extends Statement {
	/**
	 * Warning: Do not use this outside of migrations
	 */
	public static setDefault<TYPE extends TypeString | OptionalTypeString> (value: MigrationTypeFromString<TYPE> | ExpressionInitialiser<{}, MigrationTypeFromString<TYPE>>) {
		const expr = typeof value === "function" ? Expression.compile(value) : undefined;
		const stringifiedValue = expr?.text ?? Expression.stringifyValueRaw(value as MigrationTypeFromString<ExtractTypeString<TYPE>>);
		return new CreateColumnSubStatement(`DEFAULT (${stringifiedValue})`, expr?.values);
	}

	public static setNotNull () {
		return new CreateColumnSubStatement("NOT NULL");
	}

	public static setCollation (collation: string) {
		return new CreateColumnSubStatement(`COLLATE ${collation}`);
	}

	private constructor (private readonly compiled: string, private readonly vars?: any[]) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled, undefined, this.vars);
	}
}

export class AlterColumn<NAME extends string, TYPE extends TypeString | OptionalTypeString> extends Statement.Super<AlterColumnSubStatement | AlterColumnSetType<TypeString>> {

	public constructor (public name: NAME) {
		super();
	}

	public setType<TYPE extends TypeString> (type: TYPE, initialiser?: Initialiser<AlterColumnSetType<TYPE>>) {
		return this.addStandaloneOperation<AlterColumn<NAME, TYPE>>(AlterColumnSubStatement.setType(type, initialiser));
	}

	public setDefault (value: MigrationTypeFromString<TYPE> | ExpressionInitialiser<{}, MigrationTypeFromString<TYPE>>) {
		if (value === null)
			return this.dropDefault();
		else
			return this.addStandaloneOperation(AlterColumnSubStatement.setDefault(value));
	}

	public dropDefault () {
		return this.addStandaloneOperation(AlterColumnSubStatement.dropDefault());
	}

	public setNotNull () {
		return this.addStandaloneOperation(AlterColumnSubStatement.setNotNull());
	}

	public dropNotNull () {
		return this.addStandaloneOperation<AlterColumn<NAME, TYPE extends TypeString ? OptionalTypeString<TYPE> : TYPE>>(AlterColumnSubStatement.dropNotNull());
	}

	protected compileOperation (operation: string) {
		return `ALTER COLUMN ${this.name} ${operation}`;
	}
}

class AlterColumnSubStatement extends Statement {
	/**
	 * Warning: Do not use this outside of migrations
	 */
	public static setDefault<TYPE extends TypeString> (value: MigrationTypeFromString<TYPE | OptionalTypeString<TYPE>> | ExpressionInitialiser<{}, MigrationTypeFromString<TYPE | OptionalTypeString<TYPE>>>) {
		const expr = typeof value === "function" ? Expression.compile(value) : undefined;
		const stringifiedValue = expr?.text ?? Expression.stringifyValueRaw(value as MigrationTypeFromString<TYPE>);
		return new AlterColumnSubStatement(`SET DEFAULT (${stringifiedValue})`, expr?.values);
	}

	public static dropDefault () {
		return new AlterColumnSubStatement("DROP DEFAULT");
	}

	public static setNotNull () {
		return new AlterColumnSubStatement("SET NOT NULL");
	}

	public static dropNotNull () {
		return new AlterColumnSubStatement("DROP NOT NULL");
	}

	public static setType<TYPE extends TypeString> (type: TYPE, initialiser?: Initialiser<AlterColumnSetType<TYPE>>) {
		const setType = new AlterColumnSetType(type);
		initialiser?.(setType);
		return setType;
	}

	private constructor (private readonly compiled: string, private readonly vars?: any[]) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled, undefined, this.vars);
	}
}

export class AlterColumnSetType<TYPE extends TypeString> extends Statement.Super<AlterColumnSetTypeSubStatement> {

	public constructor (private readonly type: TYPE) {
		super();
		this.addParallelOperation(AlterColumnSetTypeSubStatement.type(type));
	}

	public using () { // TODO accept params
		return this.addParallelOperation(AlterColumnSetTypeSubStatement.using());
	}

	// TODO collate

	protected compileOperation (operation: string) {
		return `${operation}`;
	}

	protected override joinParallelOperations (operations: string[]): string {
		return operations.join(" ");
	}
}

class AlterColumnSetTypeSubStatement extends Statement {

	public static type (type: TypeString) {
		return new AlterColumnSetTypeSubStatement(`TYPE ${type}`);
	}

	public static using () {
		// TODO
		return new AlterColumnSetTypeSubStatement("USING");
	}

	private constructor (private readonly compiled: string, private readonly vars?: any[]) {
		super();
	}

	public compile () {
		return this.queryable(this.compiled, undefined, this.vars);
	}
}
