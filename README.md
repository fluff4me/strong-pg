# StrongPG

Strongly-typed database migrations & querying, a wrapper around the [`pg`](https://www.npmjs.com/package/pg) module.

This package is currently in development, with *only* support for migrations.

Since the package is in development, there's not full documentation, but I can provide some examples:

# Set up table schemas
```ts
import { DataType } from "strong-pg/IStrongPG";
import Schema from "strong-pg/Schema";

export const TAG_MAX_LENGTHS_V3 = {
	name: 64,
	description: 512,
};

export const TAG_CATEGORIES_SCHEMA_V3 = Schema.table({
	id: DataType.BIGSERIAL,
	PRIMARY_KEY: Schema.primaryKey("id"),
	name: DataType.VARCHAR(TAG_MAX_LENGTHS_V3.name),
	description: DataType.VARCHAR(TAG_MAX_LENGTHS_V3.description),
});

export const TAGS_SCHEMA_V3 = Schema.table({
	id: DataType.BIGSERIAL,
	PRIMARY_KEY: Schema.primaryKey("id"),
	name: DataType.VARCHAR(TAG_MAX_LENGTHS_V3.name),
	category: DataType.BIGINT,
	description: DataType.VARCHAR(TAG_MAX_LENGTHS_V3.description),
});
```

# Create a database schema including the new table schemas
```ts
import { SCHEMA_V2 } from "../m2/m2";
import { TAGS_SCHEMA_V3, TAG_CATEGORIES_SCHEMA_V3, TAG_MAX_LENGTHS_V3 } from "./TagsV3";
import { DataType } from "strong-pg/IStrongPG";
import Migration from "strong-pg/Migration";
import Schema from "strong-pg/Schema";

export const SCHEMA_V3 = Schema.database({
	tables: {
		tags: TAGS_SCHEMA_V3,
		tag_categories: TAG_CATEGORIES_SCHEMA_V3,
	},
	indices: {
		tag_categories_unique: Schema.INDEX,
		tags_unique: Schema.INDEX,
	},
	collations: {
		ci: Schema.COLLATION,
	},
});
```

# Set up a migration from the previous version of the schema to the version defined above
```ts
let m3: Migration<typeof SCHEMA_V2, typeof SCHEMA_V3>;

m3 = new Migration(SCHEMA_V2)

	.createCollation("ci", "icu", "und-u-ks-level2", false)

	.createTable("tag_categories", table => table
		.addColumn("id", DataType.BIGSERIAL)
		.addPrimaryKey("id")
		.addColumn("name", DataType.VARCHAR(TAG_MAX_LENGTHS_V3.name), c => c.notNull().collate("ci"))
		.addColumn("description", DataType.VARCHAR(TAG_MAX_LENGTHS_V3.description)))

	.createTable("tags", table => table
		.addColumn("id", DataType.BIGSERIAL)
		.addPrimaryKey("id")
		.addColumn("name", DataType.VARCHAR(TAG_MAX_LENGTHS_V3.name), c => c.notNull().collate("ci"))
		.addColumn("category", DataType.BIGINT)
		.foreignKey("category", "tag_categories", "id")
		.addColumn("description", DataType.VARCHAR(TAG_MAX_LENGTHS_V3.description)))

	.createIndex("tag_categories_unique", "tag_categories", index => index
		.unique()
		.column("name"))

	.createIndex("tags_unique", "tags", index => index
		.unique()
		.column("name")
		.column("category"))

	.alterTable("tags", alter => alter
		.unique("tags_unique", "tags_unique"))

	.schema(SCHEMA_V3);

export default m3;
```

# Ensure migrated before running queries
```ts
import m1 from "./migration/m1/m1";
import m2 from "./migration/m2/m2";
import m3 from "./migration/m3/m3";
import m4 from "./migration/m4/m4";
import m5, { SCHEMA_V5 } from "./migration/m5/m5";
import { Pool } from "pg";
import Database from "strong-pg";

type Schema = typeof SCHEMA_V5;
export interface ISchema extends Schema { }

let pool: Pool | Promise<Pool> | undefined;
export default async function getPool () {
	return pool ??= (async () => {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const database = new Database<ISchema>(SCHEMA_V5, pool);

		await database.dropIfShould();
		await pool.query("CREATE SCHEMA IF NOT EXISTS public");
		await pool.query(`SET search_path TO public`);

		database.setHistory(history => history
			.migration(m1)
			.migration(m2)
			.migration(m3)
			.migration(m4)
			.migration(m5));

		await database.migrate();

		return pool;
	})();
}
```