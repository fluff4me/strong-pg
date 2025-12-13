import Statement from '../Statement'

export default class CreateType extends Statement.Basic {

	public constructor (name: string) {
		super(`CREATE TYPE ${name} AS ()`)
	}

}
