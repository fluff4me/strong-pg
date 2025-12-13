import Statement from '../Statement'

export default class CreateTable extends Statement.Basic {

	public constructor (name: string) {
		super(`CREATE TABLE ${name} ()`)
	}

}
