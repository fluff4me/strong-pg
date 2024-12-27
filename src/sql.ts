import { DatabaseError, Pool, PoolClient, QueryConfig } from "pg"
import log, { color } from "./Log"

function isDatabaseError (value: unknown): value is DatabaseError {
	return value instanceof DatabaseError
		|| (typeof value === "object" && !!value && "internalQuery" in value)
}

type SqlTemplateData = [segments: TemplateStringsArray, interpolations: unknown[]]

namespace _ {
	export interface SQL extends Omit<QueryConfig, "text" | "values"> { }
	export class SQL implements QueryConfig {

		#data: SqlTemplateData
		public constructor (...data: SqlTemplateData) {
			this.#data = data
		}

		public get text (): string {
			this.#compile()
			return this.text
		}

		public get values (): unknown[] | undefined {
			this.#compile()
			return this.values
		}

		public async query (pool: Pool | PoolClient) {
			try {
				return await pool.query(this)
			} catch (err) {
				if (!isDatabaseError(err))
					throw err

				log(color("red", "Error: ") + err.message + (err.detail ? `: ${err.detail}` : "")
					+ (err.hint ? color("darkGray", `\nHint: ${err.hint}`) : ""))

				if (err.position === undefined)
					return

				let line: string
				const start = this.text.lastIndexOf("\n", +err.position) + 1
				const previousLine = this.text.substring(this.text.lastIndexOf("\n", start - 2) + 1, start - 1).trim()
				const end = this.text.indexOf("\n", +err.position)
				line = this.text.substring(start, end)
				const length = line.length
				line = line.trim()
				const trimmedWhitespace = length - line.length
				const position = +err.position - start - trimmedWhitespace

				if (previousLine)
					log("  > ", color("darkGray", previousLine))

				log("  > ", line)

				if (position !== undefined)
					log("    ", " ".repeat(Math.max(0, position - 1)) + color("red", "^"))
			}
		}

		#compile () {
			const [topLayerSegments, topLayerInterpolations] = this.#data
			if (!topLayerInterpolations.length) {
				Object.defineProperty(this, "text", { value: topLayerSegments[0] })
				Object.defineProperty(this, "values", { value: undefined })
				return
			}

			let resultInterpolations: unknown[] | undefined

			let vi = 1
			const recurse = (recursiveData?: SqlTemplateData) => {
				const [segments, interpolations] = recursiveData ?? this.#data

				let text = segments[0]
				for (let i = 0; i < interpolations.length; i++) {
					const interpolation = interpolations[i]

					if (interpolation instanceof SQL) {
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

		protected get asRawSql (): string {
			this.#compileRaw()
			return this.asRawSql
		}

		#compileRaw () {
			const [topLayerSegments, topLayerInterpolations] = this.#data
			if (!topLayerInterpolations.length) {
				Object.defineProperty(this, "asRawSql", { value: topLayerSegments[0] })
				return
			}

			const recurse = (recursiveData?: SqlTemplateData) => {
				const [segments, interpolations] = recursiveData ?? this.#data

				let text = segments[0]
				for (let i = 0; i < interpolations.length; i++) {
					const interpolation = interpolations[i]

					if (interpolation instanceof SQL) {
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
	}
}

export type SQL = _.SQL
export namespace SQL {
	export function is (value: unknown) {
		return value instanceof _.SQL
	}
}

export function sql (segments: TemplateStringsArray, ...interpolations: unknown[]): SQL {
	return new _.SQL(segments, interpolations)
}
