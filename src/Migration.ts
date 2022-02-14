import { DatabaseSchema, TableName } from "./Schema";
import AlterTable from "./statements/table/AlterTable";
import CreateTable from "./statements/table/CreateTable";
import DropTable from "./statements/table/DropTable";
import Transaction from "./Transaction";

export default class Migration<SCHEMA_START extends DatabaseSchema | null = null, SCHEMA_END extends DatabaseSchema = SCHEMA_START extends null ? DatabaseSchema.Empty : SCHEMA_START> extends Transaction {

	public schemaEnd?: SCHEMA_END;

	public constructor (public readonly schemaStart?: SCHEMA_START) {
		super();
	}

	public createTable<NAME extends string, TABLE_SCHEMA_NEW> (
		table: NAME,
		initialiser: (statement: AlterTable<SCHEMA_END["tables"][NAME]>) => AlterTable<SCHEMA_END["tables"][NAME], TABLE_SCHEMA_NEW>
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>> {
		this.add(new CreateTable(table));
		this.add(initialiser(new AlterTable(table)));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public alterTable<NAME extends TableName<SCHEMA_END>, TABLE_SCHEMA_NEW> (
		table: NAME,
		initialiser: (statement: AlterTable<SCHEMA_END["tables"][NAME]>) => AlterTable<SCHEMA_END["tables"][NAME], TABLE_SCHEMA_NEW>
	): Migration<SCHEMA_START, DatabaseSchema.ReplaceTable<SCHEMA_END, NAME, TABLE_SCHEMA_NEW>> {
		this.add(initialiser(new AlterTable(table)));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public dropTable<NAME extends TableName<SCHEMA_END>> (table: NAME): Migration<SCHEMA_START, DatabaseSchema.DropTable<SCHEMA_END, NAME>> {
		this.add(new DropTable(table));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public schema<SCHEMA_TEST extends SCHEMA_END> (schema: SCHEMA_TEST): SCHEMA_END extends SCHEMA_TEST ? Migration<SCHEMA_START, SCHEMA_TEST> : "Migration does not match schema" {
		this.schemaEnd = schema;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}
}
