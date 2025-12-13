import Statement from '../Statement'

export default class RenameTrigger extends Statement.Basic {

	public constructor (on: string, name: string, newName: string) {
		super(`ALTER TRIGGER ${name} ON ${on} RENAME TO ${newName}`)
	}

}
