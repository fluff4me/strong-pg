import Statement from "../../Statement";

export default class DropTable<TABLE extends string> extends Statement {
	public constructor (public readonly table: TABLE) {
		super();
	}

	public compile () {
		return `DROP TABLE ${this.table}`;
	}
}
