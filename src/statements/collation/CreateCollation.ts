import Statement from '../Statement'

export default class CreateCollation extends Statement.Basic {

	public constructor (name: string, provider: 'icu' | 'libc', locale: string, deterministic: boolean) {
		super(`CREATE COLLATION ${name} (provider=${provider},locale='${locale}',deterministic=${deterministic ? 'true' : 'false'})`)
	}

}
