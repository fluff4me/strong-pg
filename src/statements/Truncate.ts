import Statement from './Statement'

export default class TruncateTable extends Statement<[]> {

	public constructor (public readonly tableName: string | undefined) {
		super()
	}

	private shouldCascade?: true
	public cascade () {
		this.shouldCascade = true
		return this
	}

	public compile () {
		return this.queryable(`TRUNCATE ${this.tableName ?? ''} ${this.shouldCascade ? 'CASCADE' : ''}`)
	}

}
