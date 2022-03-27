import Statement from "../Statement";

export default class DropTrigger extends Statement.Basic {
	public constructor (on: string, name: string) {
		super(`DROP TRIGGER ${name} ON ${on}`);
	}
}
