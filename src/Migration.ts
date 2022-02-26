import { Initialiser } from "./IStrongPG";
import { DatabaseSchema } from "./Schema";
import AlterEnum from "./statements/enum/AlterEnum";
import CreateEnum from "./statements/enum/CreateEnum";
import CreateIndex from "./statements/index/CreateIndex";
import DropIndex from "./statements/index/DropIndex";
import AlterTable from "./statements/table/AlterTable";
import CreateTable from "./statements/table/CreateTable";
import DropTable from "./statements/table/DropTable";
import Transaction from "./Transaction";

export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {

	public readonly schemaStart?: SCHEMA_START;
	public schemaEnd?: SCHEMA_END;

	public constructor (schemaStart?: SCHEMA_START) {
		super();
		this.schemaStart = schemaStart as any;
	}

	public createTable<NAME extends string, TABLE_SCHEMA_NEW> (
		table: NAME,
		alter: NAME extends DatabaseSchema.TableName<SCHEMA_END> ? never : Initialiser<AlterTable<null>, AlterTable<null, TABLE_SCHEMA_NEW>>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>> {
		this.add(new CreateTable(table));
		this.add(alter(new AlterTable(table)));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public alterTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>, TABLE_SCHEMA_NEW> (
		table: NAME,
		alter: Initialiser<AlterTable<DatabaseSchema.Table<SCHEMA_END, NAME>>, AlterTable<DatabaseSchema.Table<SCHEMA_END, NAME>, TABLE_SCHEMA_NEW>>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>> {
		this.add(alter(new AlterTable(table)));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropTable<NAME extends DatabaseSchema.TableName<SCHEMA_END>> (table: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<SCHEMA_END, NAME>> {
		this.add(new DropTable(table));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createIndex<NAME extends string, TABLE extends DatabaseSchema.TableName<SCHEMA_END>> (
		name: NAME,
		on: TABLE,
		initialiser: NAME extends DatabaseSchema.IndexName<SCHEMA_END> ? never : Initialiser<CreateIndex<NAME, DatabaseSchema.Table<SCHEMA_END, TABLE>>, CreateIndex<NAME, SCHEMA_END, true>>,
	): Migration<SCHEMA_START, DatabaseSchema.CreateIndex<SCHEMA_END, NAME>> {
		const createIndex = new CreateIndex(name, on);
		initialiser(createIndex);
		this.add(createIndex);
		return this as any;
	}

	public dropIndex<NAME extends DatabaseSchema.IndexName<SCHEMA_END>> (name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropIndex<SCHEMA_END, NAME>> {
		this.add(new DropIndex(name));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public createEnum<NAME extends string, ENUM_SCHEMA extends string[]> (
		name: NAME,
		alter: NAME extends DatabaseSchema.EnumName<SCHEMA_END> ? never : Initialiser<AlterEnum<NAME, []>, AlterEnum<NAME, ENUM_SCHEMA>>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA>> {
		this.add(new CreateEnum(name));
		this.add(alter(new AlterEnum<NAME, []>(name)));
		return this as any;
	}

	public alterEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>, ENUM_SCHEMA_NEW extends string[]> (
		name: NAME,
		alter: Initialiser<AlterEnum<NAME, DatabaseSchema.Enum<SCHEMA_END, NAME>>, AlterEnum<NAME, ENUM_SCHEMA_NEW>>,
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceEnum<SCHEMA_END, NAME, ENUM_SCHEMA_NEW>> {
		this.add(alter(new AlterEnum<NAME, []>(name)));
		return this as any;
	}

	public dropEnum<NAME extends DatabaseSchema.EnumName<SCHEMA_END>> (name: NAME): Migration<SCHEMA_START, DatabaseSchema.DropEnum<SCHEMA_END, NAME> & DatabaseSchema> {
		this.add(new DropIndex(name));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (schema: SCHEMA_TEST): SCHEMA_END extends SCHEMA_TEST ? Migration<SCHEMA_START, SCHEMA_TEST> : "Migration does not match schema" {
		this.schemaEnd = schema as any;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}
}
