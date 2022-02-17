import Statement from "../Statement";

export default class CreateTable<TABLE extends string> extends Statement {
	public constructor (public readonly table: TABLE) {
		super();
	}

	public compile () {
		return `CREATE TABLE ${this.table} ()`;
	}
}
