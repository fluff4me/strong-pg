import Statement from "../Statement";

export default class RenameTable extends Statement.Basic {
	public constructor (name: string, newName: string) {
		super(`ALTER TABLE ${name} RENAME TO ${newName}`);
	}
}
