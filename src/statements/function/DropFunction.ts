import Statement from "../Statement";

export default class DropFunction extends Statement.Basic {
	public constructor (name: string) {
		super(`DROP FUNCTION ${name}`);
	}
}
