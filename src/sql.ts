import { QueryConfig } from "pg"

type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]]

namespace _ {
	export interface Sql extends Omit<QueryConfig, "text" | "values"> { }
	export class Sql implements QueryConfig {

		#data: SqlTemplateData
		public constructor (...data: SqlTemplateData) {
			this.#data = data
		}

		public get text (): string {
			this.#compile()
			return this.text
		}

		public get values (): unknown[] {
			this.#compile()
			return this.values
		}

		protected get asRawSql (): string {
			this.#compileRaw()
			return this.asRawSql
		}

		#compileRaw () {
			const [topLayerSegments, topLayerInterpolations] = this.#data
			if (!topLayerInterpolations.length)
				return topLayerSegments[0]

			const recurse = (recursiveData?: SqlTemplateData) => {
				const [segments, interpolations] = recursiveData ?? this.#data

				let text = segments[0]
				for (let i = 0; i < interpolations.length; i++) {
					const interpolation = interpolations[i]

					if (interpolation instanceof Sql) {
						text += recurse(interpolation.#data)
						continue
					}

					text += `${String(interpolation)}${segments[i + 1]}`
				}

				return text
			}

			const text = recurse()
			Object.defineProperty(this, "asRawSql", { value: text })
		}

		#compile () {
			const [topLayerSegments, topLayerInterpolations] = this.#data
			if (!topLayerInterpolations.length)
				return { text: topLayerSegments[0] }

			let resultInterpolations: unknown[] | undefined

			let vi = 1
			const recurse = (recursiveData?: SqlTemplateData) => {
				const [segments, interpolations] = recursiveData ?? this.#data

				let text = segments[0]
				for (let i = 0; i < interpolations.length; i++) {
					const interpolation = interpolations[i]

					if (interpolation instanceof Sql) {
						const subData = interpolation.#data
						if (subData)
							resultInterpolations ??= topLayerInterpolations.slice(0, i)
						text += recurse(subData)
						continue
					}

					resultInterpolations?.push(interpolation)
					text += `$${vi++}${segments[i + 1]}`
				}

				return text
			}

			const text = recurse()

			Object.defineProperty(this, "text", { value: text })
			Object.defineProperty(this, "values", { value: resultInterpolations ?? topLayerInterpolations })

		}
	}
}

export type Sql = _.Sql
export namespace Sql {
	export function is (value: unknown) {
		return value instanceof _.Sql
	}
}

export function sql (segments: TemplateStringsArray, ...interpolations: unknown[]): QueryConfig {
	if (!interpolations.length)
		return { text: segments[0] }

	return new _.Sql(segments, interpolations)

}
