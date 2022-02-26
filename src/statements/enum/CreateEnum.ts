import Statement from "../Statement";

export default class CreateEnum<NAME extends string> extends Statement {
	public constructor (public readonly name: NAME) {
		super();
	}

	public compile () {
		return `CREATE TYPE ${this.name} AS ENUM ()`;
	}
}
