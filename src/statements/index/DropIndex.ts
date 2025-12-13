import Statement from '../Statement'

export default class DropIndex extends Statement.Basic {

	public constructor (name: string) {
		super(`DROP INDEX ${name}`)
	}

}
