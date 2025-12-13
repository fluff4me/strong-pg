import Statement from '../Statement'

export default class DropCollation extends Statement.Basic {

	public constructor (name: string) {
		super(`DROP COLLATION ${name}`)
	}

}
