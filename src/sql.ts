import { QueryConfig } from "pg"

const SYMBOL_SQL = Symbol("Sql")

type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]]
export interface Sql extends QueryConfig {
	[SYMBOL_SQL]: SqlTemplateData
}

export function isSql (value: unknown): value is Sql {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return typeof value === "object" && !!value && !!(value as Sql)[SYMBOL_SQL]
}

export function sql (segments: TemplateStringsArray, ...interpolations: unknown[]): QueryConfig {
	if (!interpolations.length)
		return { text: segments[0] }

	const data: SqlTemplateData = [segments, interpolations];
	const result: Sql = {
		[SYMBOL_SQL]: data,
		get text () {
			compile(data)
			return this.text
		},
		get values () {
			compile(data)
			return this.values
		},
	}

	return result

	function compile ([segments, interpolations]: SqlTemplateData) {
		if (!interpolations.length)
			return { text: segments[0] }

		let resultInterpolations: unknown[] | undefined

		let vi = 1
		const text = recurse()

		Object.defineProperty(result, "text", { value: text })
		Object.defineProperty(result, "values", { value: resultInterpolations ?? interpolations })

		function recurse (recursiveData?: SqlTemplateData) {
			const [segments, interpolations] = recursiveData ?? data

			let text = segments[0]
			for (let i = 0; i < interpolations.length; i++) {
				const interpolation = interpolations[i]

				if (isSql(interpolation)) {
					const subData = interpolation[SYMBOL_SQL]
					if (subData)
						resultInterpolations ??= data[1].slice(0, i)
					text += recurse(subData)
					continue
				}

				resultInterpolations?.push(interpolation)
				text += `$${vi++}${segments[i + 1]}`
			}

			return text
		}
	}
}
