import Statement from '../Statement'

export default class DropType extends Statement.Basic {

	public constructor (name: string) {
		super(`DROP TYPE ${name}`)
	}

}
