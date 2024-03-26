import Statement from "./Statement";

export default class TruncateTable extends Statement<[]> {

	public constructor (public readonly tableName: string | undefined) {
		super();
	}

	public compile () {
		return this.queryable(`TRUNCATE ${this.tableName ?? ""}`);
	}
}
