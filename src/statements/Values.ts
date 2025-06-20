import { InputTypeFromString, TypeString } from "../IStrongPG";
import sql from "../sql";

export default class Values<NAME extends string, COLUMNS extends readonly string[], TYPES extends readonly TypeString[] = never> {

	private data: { [INDEX in keyof TYPES]: InputTypeFromString<TYPES[INDEX]> }[] = [];
	private typeStrings: TYPES = [] as never;
	public constructor (private readonly name: NAME, private readonly columns: COLUMNS) { }

	public types<NEW_TYPES extends ([TYPES] extends [never] ? any[] & { length: COLUMNS["length"] } : TYPES)> (...types: NEW_TYPES) {
		this.typeStrings = types as never;
		return this as any as Values<NAME, COLUMNS, readonly [...NEW_TYPES]>;
	}

	public values (...rows: { [INDEX in keyof TYPES]: InputTypeFromString<TYPES[INDEX]> }[]): Values<NAME, COLUMNS, TYPES> {
		this.data.push(...rows);
		return this as Values<NAME, COLUMNS, TYPES>;
	}

	public compile (): sql {
		const rows = this.data.map((values, index) => {
			if (!index) {
				// explicitly cast types for first row
				const castedValues = values.map((value, index) => sql`${value}::${sql.raw(this.typeStrings[index])}`);
				return sql`(${sql.join(castedValues, sql`,`)})`;
			}

			return sql`(${sql.join(values, sql`,`)})`
		});
		const as = ` AS ${this.name} (${this.columns.join(",")})`;
		return sql`(VALUES ${sql.join(rows, sql`,`)})${sql.raw(as)}`;
	}
}
