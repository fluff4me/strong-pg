import Statement from "../Statement";

export default class DropIndex<NAME extends string> extends Statement {
	public constructor (public readonly name: NAME) {
		super();
	}

	public compile () {
		return `DROP INDEX ${this.name}`;
	}
}
