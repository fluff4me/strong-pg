import type sql from '../sql'
import Statement from './Statement'

export default class Do extends Statement {

	public constructor (private readonly sql: sql) {
		super()
	}

	public override compile (): Statement.Queryable | Statement.Queryable[] {
		return this.queryable(this.sql.text)
	}

}
