import Database from "./Database";
import { StackUtil } from "./IStrongPG";
import { DatabaseSchema, TableSchema } from "./Schema";
import CreateCollation from "./statements/collation/CreateCollation";
import DropCollation from "./statements/collation/DropCollation";
import AlterEnum, { AlterEnumInitialiser } from "./statements/enum/AlterEnum";
import CreateEnum from "./statements/enum/CreateEnum";
import DropEnum from "./statements/enum/DropEnum";
import CreateOrReplaceFunction, { CreateOrReplaceFunctionInitialiser } from "./statements/function/CreateOrReplaceFunction";
import DropFunction from "./statements/function/DropFunction";
import CreateIndex, { CreateIndexInitialiser } from "./statements/index/CreateIndex";
import DropIndex from "./statements/index/DropIndex";
import Statement from "./statements/Statement";
import AlterTable, { AlterTableInitialiser } from "./statements/table/AlterTable";
import CreateTable from "./statements/table/CreateTable";
import DropTable from "./statements/table/DropTable";
import RenameTable from "./statements/table/RenameTable";
import CreateTrigger, { CreateTriggerInitialiser } from "./statements/trigger/CreateTrigger";
import DropTrigger from "./statements/trigger/DropTrigger";
import RenameTrigger from "./statements/trigger/RenameTrigger";
import Transaction from "./Transaction";

export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {

	public readonly schemaStart?: SCHEMA_START;
	public schemaEnd?: SCHEMA_END;

	private commits: MigrationCommit[] = [];
	public readonly file = StackUtil.getCallerFile();

	private db!: Database<SCHEMA_END>;

	public constructor (schemaStart?: SCHEMA_START) {
		super();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.schemaStart = schemaStart as any;
	}

	public then (statementSupplier: (db: Database<SCHEMA_END>) => Statement<any>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.add(() => statementSupplier(this.db));
		return this;
	}

	public createTable<NAME extends string, TABLE_SCHEMA_NEW extends TableSchema> (
		table: NAME,
		alter: NAME extends DatabaseSchema.TableName<SCHEMA_END> ? never : AlterTableInitialiser<SCHEMA_END, null, TABLE_SCHEMA_NEW>,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "tables"
		? ({ [TABLE_NAME in NAME | keyof SCHEMA_END["tables"]]: TABLE_NAME extends NAME ? TABLE_SCHEMA_NEW : SCHEMA_END["tables"][TABLE_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new CreateTable(table).setCaller());
		this.add(alter(new AlterTable(table)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public alterTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, TABLE_SCHEMA_NEW extends TableSchema> (
		table: NAME,
		alter: AlterTableInitialiser<SCHEMA_END, DatabaseSchema.Table<SCHEMA_END, NAME>, TABLE_SCHEMA_NEW>,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "tables"
		? ({ [TABLE_NAME in NAME | keyof SCHEMA_END["tables"]]: TABLE_NAME extends NAME ? TABLE_SCHEMA_NEW : SCHEMA_END["tables"][TABLE_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(alter(new AlterTable(table)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public renameTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, NEW_NAME extends string> (
		table: NAME,
		newName: NEW_NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "tables"
		? ({ [TABLE_NAME in NEW_NAME | Exclude<keyof SCHEMA_END["tables"], NAME>]: TABLE_NAME extends NEW_NAME ? SCHEMA_END["tables"][NAME] : SCHEMA_END["tables"][TABLE_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new RenameTable(table, newName).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>> (
		table: NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "tables"
		? ({ [TABLE_NAME in Exclude<keyof SCHEMA_END["tables"], NAME>]: SCHEMA_END["tables"][TABLE_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new DropTable(table).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createIndex<NAME extends string, TABLE extends DatabaseSchema.TableName<SCHEMA_END>> (
		name: NAME,
		on: TABLE,
		initialiser: NAME extends DatabaseSchema.IndexName<SCHEMA_END> ? never : DatabaseSchema.Table<SCHEMA_END, TABLE> extends infer TABLE_SCHEMA extends Record<string, any> ? CreateIndexInitialiser<TABLE_SCHEMA> : never,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "indices"
		? ({ [INDEX_NAME in NAME | keyof SCHEMA_END["indices"]]: {} })
		: SCHEMA_END[KEY]
	}> {
		const createIndex = new CreateIndex(name, on).setCaller();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(createIndex as any);
		this.add(createIndex);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropIndex<NAME extends DatabaseSchema.IndexName<SCHEMA_END>> (
		name: NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "indices"
		? ({ [INDEX_NAME in Exclude<keyof SCHEMA_END["indices"], NAME>]: {} })
		: SCHEMA_END[KEY]
	}> {
		this.add(new DropIndex(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createEnum<NAME extends string, ENUM_SCHEMA extends string[]> (
		name: NAME,
		alter: NAME extends DatabaseSchema.EnumName<SCHEMA_END> ? never : AlterEnumInitialiser<[], ENUM_SCHEMA>,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "enums"
		? ({ [ENUM_NAME in NAME | keyof SCHEMA_END["enums"]]: ENUM_NAME extends NAME ? ENUM_SCHEMA : SCHEMA_END["enums"][ENUM_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new CreateEnum(name).setCaller());
		this.add(alter(new AlterEnum<[]>(name)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public alterEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>, ENUM_SCHEMA_NEW extends string[]> (
		name: NAME,
		alter: AlterEnumInitialiser<DatabaseSchema.Enum<SCHEMA_END, NAME>, ENUM_SCHEMA_NEW>,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "enums"
		? ({ [ENUM_NAME in NAME | keyof SCHEMA_END["enums"]]: ENUM_NAME extends NAME ? ENUM_SCHEMA_NEW : SCHEMA_END["enums"][ENUM_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(alter(new AlterEnum<[]>(name)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>> (
		name: NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "enums"
		? ({ [ENUM_NAME in Exclude<keyof SCHEMA_END["enums"], NAME>]: SCHEMA_END["enums"][ENUM_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new DropEnum(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends string> (
		on: TABLE,
		name: NAME,
		initialiser: CreateTriggerInitialiser<DatabaseSchema.Table<SCHEMA_END, TABLE>, Exclude<SCHEMA_END["functions"], undefined>>,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "triggers"
		? ({ [TRIGGER_NAME in NAME | keyof SCHEMA_END["triggers"]]: {} })
		: SCHEMA_END[KEY]
	}> {
		const createTrigger = new CreateTrigger(name, on).setCaller();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(createTrigger as any)
		this.add(createTrigger);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public renameTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>, NEW_NAME extends string> (
		on: TABLE,
		name: NAME,
		newName: NEW_NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "triggers"
		? ({ [TRIGGER_NAME in NEW_NAME | Exclude<keyof SCHEMA_END["triggers"], NAME>]: {} })
		: SCHEMA_END[KEY]
	}> {
		this.add(new RenameTrigger(on, name, newName).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>> (
		on: TABLE,
		name: NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "triggers"
		? ({ [TRIGGER_NAME in Exclude<keyof SCHEMA_END["triggers"], NAME>]: {} })
		: SCHEMA_END[KEY]
	}> {
		this.add(new DropTrigger(on, name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createOrReplaceFunction<NAME extends string> (
		name: NAME,
		initialiser: CreateOrReplaceFunctionInitialiser,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "functions"
		? ({ [FUNCTION_NAME in NAME | keyof SCHEMA_END["functions"]]: FUNCTION_NAME extends NAME ? (...args: any[]) => any : SCHEMA_END["functions"][FUNCTION_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(initialiser(new CreateOrReplaceFunction(name)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropFunction<NAME extends DatabaseSchema.FunctionName<SCHEMA_END>> (
		name: NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "functions"
		? ({ [FUNCTION_NAME in Exclude<keyof SCHEMA_END["functions"], NAME>]: SCHEMA_END["functions"][FUNCTION_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new DropFunction(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createCollation<NAME extends string> (
		name: NAME,
		provider: "icu" | "libc",
		locale: string,
		deterministic: boolean,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "collations"
		? ({ [COLLATION_NAME in NAME | keyof SCHEMA_END["collations"]]: {} })
		: SCHEMA_END[KEY]
	}> {
		this.add(new CreateCollation(name, provider, locale, deterministic).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropCollation<NAME extends DatabaseSchema.CollationName<SCHEMA_END>> (
		name: NAME,
	): Migration<SCHEMA_START, {
		[KEY in keyof SCHEMA_END]: KEY extends "collations"
		? ({ [FUNCTION_NAME in Exclude<keyof SCHEMA_END["collations"], NAME>]: SCHEMA_END["collations"][FUNCTION_NAME] })
		: SCHEMA_END[KEY]
	}> {
		this.add(new DropCollation(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public commit () {
		if (!this.statements.length)
			return this;

		const transaction = new MigrationCommit(this.file, !!this.commits.length);
		for (const statement of this.statements)
			transaction.add(statement);

		this.statements.splice(0, Infinity);
		this.commits.push(transaction);
		return this;
	}

	public getCommits () {
		this.commit();
		return this.commits;
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (schema: SCHEMA_TEST): SCHEMA_END extends SCHEMA_TEST ? Migration<SCHEMA_START, SCHEMA_TEST> : "Migration does not match schema" {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.schemaEnd = schema as any;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}
}

export type MigrationVersion = `${number}` | `${number}.${number}`;

export class MigrationCommit extends Transaction {

	public version?: MigrationVersion;

	public constructor (public readonly file: string | undefined, public readonly virtual: boolean) {
		super();
	}
}
