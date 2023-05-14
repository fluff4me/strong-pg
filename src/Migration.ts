import { StackUtil } from "./IStrongPG";
import { DatabaseSchema } from "./Schema";
import CreateCollation from "./statements/collation/CreateCollation";
import DropCollation from "./statements/collation/DropCollation";
import AlterEnum, { AlterEnumInitialiser } from "./statements/enum/AlterEnum";
import CreateEnum from "./statements/enum/CreateEnum";
import DropEnum from "./statements/enum/DropEnum";
import CreateOrReplaceFunction, { CreateOrReplaceFunctionInitialiser } from "./statements/function/CreateOrReplaceFunction";
import DropFunction from "./statements/function/DropFunction";
import CreateIndex, { CreateIndexInitialiser } from "./statements/index/CreateIndex";
import DropIndex from "./statements/index/DropIndex";
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

	public constructor (schemaStart?: SCHEMA_START) {
		super();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.schemaStart = schemaStart as any;
	}

	public createTable<NAME extends string, TABLE_SCHEMA_NEW> (
		table: NAME,
		alter: NAME extends DatabaseSchema.TableName<SCHEMA_END> ? never : AlterTableInitialiser<SCHEMA_END, null, TABLE_SCHEMA_NEW>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>> {
		this.add(new CreateTable(table).setCaller());
		this.add(alter(new AlterTable(table)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public alterTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, TABLE_SCHEMA_NEW> (
		table: NAME,
		alter: AlterTableInitialiser<SCHEMA_END, DatabaseSchema.Table<SCHEMA_END, NAME>, TABLE_SCHEMA_NEW>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>> {
		this.add(alter(new AlterTable(table)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public renameTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, NEW_NAME extends string> (table: NAME, newName: NEW_NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<DatabaseSchema.ReplaceTable<SCHEMA_END, NEW_NAME, DatabaseSchema.Table<SCHEMA_END, NAME>>, NAME>> {
		this.add(new RenameTable(table, newName).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>> (table: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<SCHEMA_END, NAME>> {
		this.add(new DropTable(table).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createIndex<NAME extends string, TABLE extends DatabaseSchema.TableName<SCHEMA_END>> (
		name: NAME,
		on: TABLE,
		initialiser: NAME extends DatabaseSchema.IndexName<SCHEMA_END> ? never : DatabaseSchema.Table<SCHEMA_END, TABLE> extends infer TABLE_SCHEMA extends Record<string, any> ? CreateIndexInitialiser<TABLE_SCHEMA> : never,
	): Migration<SCHEMA_START, DatabaseSchema.CreateIndex<SCHEMA_END, NAME>> {
		const createIndex = new CreateIndex(name, on).setCaller();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(createIndex as any);
		this.add(createIndex);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropIndex<NAME extends DatabaseSchema.IndexName<SCHEMA_END>> (name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropIndex<SCHEMA_END, NAME>> {
		this.add(new DropIndex(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createEnum<NAME extends string, ENUM_SCHEMA extends string[]> (
		name: NAME,
		alter: NAME extends DatabaseSchema.EnumName<SCHEMA_END> ? never : AlterEnumInitialiser<[], ENUM_SCHEMA>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA>> {
		this.add(new CreateEnum(name).setCaller());
		this.add(alter(new AlterEnum<[]>(name)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public alterEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>, ENUM_SCHEMA_NEW extends string[]> (
		name: NAME,
		alter: AlterEnumInitialiser<DatabaseSchema.Enum<SCHEMA_END, NAME>, ENUM_SCHEMA_NEW>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA_NEW>> {
		this.add(alter(new AlterEnum<[]>(name)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>> (name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropEnum<SCHEMA_END, NAME> & DatabaseSchema> {
		this.add(new DropEnum(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends string> (on: TABLE, name: NAME, initialiser: CreateTriggerInitialiser<DatabaseSchema.Table<SCHEMA_END, TABLE>, Exclude<SCHEMA_END["functions"], undefined>>): Migration<SCHEMA_START, DatabaseSchema.CreateTrigger<SCHEMA_END, NAME>> {
		const createTrigger = new CreateTrigger(name, on).setCaller();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		initialiser(createTrigger as any)
		this.add(createTrigger);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public renameTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>, NEW_NAME extends string> (on: TABLE, name: NAME, newName: NEW_NAME): Migration<SCHEMA_START, DatabaseSchema.DropTrigger<DatabaseSchema.CreateTrigger<SCHEMA_END, NEW_NAME>, NAME>> {
		this.add(new RenameTrigger(on, name, newName).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropTrigger<TABLE extends DatabaseSchema.TableName<SCHEMA_END>, NAME extends DatabaseSchema.TriggerName<SCHEMA_END>> (on: TABLE, name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTrigger<SCHEMA_END, NAME> & DatabaseSchema> {
		this.add(new DropTrigger(on, name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createOrReplaceFunction<NAME extends string> (name: NAME, initialiser: CreateOrReplaceFunctionInitialiser): Migration<SCHEMA_START, DatabaseSchema.CreateFunction<SCHEMA_END, NAME, (...args: any[]) => any>> {
		this.add(initialiser(new CreateOrReplaceFunction(name)).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropFunction<NAME extends DatabaseSchema.FunctionName<SCHEMA_END>> (name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropFunction<SCHEMA_END, NAME> & DatabaseSchema> {
		this.add(new DropFunction(name).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createCollation<NAME extends string> (name: NAME, provider: "icu" | "libc", locale: string, deterministic: boolean): Migration<SCHEMA_START, DatabaseSchema.CreateCollation<SCHEMA_END, NAME>> {
		this.add(new CreateCollation(name, provider, locale, deterministic).setCaller());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropCollation<NAME extends DatabaseSchema.CollationName<SCHEMA_END>> (name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropCollation<SCHEMA_END, NAME> & DatabaseSchema> {
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
