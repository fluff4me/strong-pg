import Statement from "../Statement";

export default class DropTable extends Statement.Basic {
	public constructor (name: string) {
		super(`DROP TABLE ${name}`);
	}
}
