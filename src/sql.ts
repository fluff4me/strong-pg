import { DatabaseError, Pool, PoolClient, QueryConfig } from "pg"
import util from "util"
import log, { color } from "./Log"
import { ExpressionInitialiser } from "./expressions/Expression"

function isDatabaseError (value: unknown): value is DatabaseError {
	return value instanceof DatabaseError
		|| (typeof value === "object" && !!value && "internalQuery" in value)
}

type SqlTemplateData = [segments: readonly string[], interpolations: unknown[]]

interface SQL extends Omit<QueryConfig, "text" | "values"> { }
class SQL implements QueryConfig {

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

	public compile (vars: unknown[]): string {
		const { text, values } = this.#compileOffset(vars.length)
		vars.push(...values ?? [])
		return text
	}

	public async query (pool: Pool | PoolClient) {
		try {
			log("  > ", color("darkGray", this.text));
			if (this.values?.length)
				for (let i = 0; i < this.values.length; i++)
					log(`    ${color("lightYellow", `$${i + 1}`)}${color("darkGray", ":")} `, util.inspect(this.values[i], undefined, Infinity, true));

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
		const { text, values } = this.#compileOffset()

		Object.defineProperty(this, "text", { value: text })
		Object.defineProperty(this, "values", { value: values })
	}

	#compileOffset (vi = 0) {
		const [topLayerSegments, topLayerInterpolations] = this.#data
		if (!topLayerInterpolations.length)
			return { text: topLayerSegments[0], values: undefined }

		let resultInterpolations: unknown[] | undefined

		vi++
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
					text += segments[i + 1]
					continue
				}

				resultInterpolations?.push(interpolation)
				text += `$${vi++}${segments[i + 1]}`
			}

			return text
		}

		const text = recurse()

		return { text, values: resultInterpolations ?? topLayerInterpolations }
	}

	/** @deprecated be careful!!! */
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
					text += segments[i + 1]
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

type sql = SQL

function sql (segments: readonly string[], ...interpolations: unknown[]): sql {
	return new SQL(segments, interpolations)
}

namespace sql {

	export type Result<RESULT> = sql & ExpressionInitialiser<any, RESULT>

	export function is (value: unknown) {
		return value instanceof SQL
	}

	export function join (segments: readonly unknown[], separator: sql): sql {
		return segments.reduce((acc, cur) => sql`${acc}${separator}${cur}`) as sql
	}

	export function raw (text: string): sql {
		return new SQL([text], [])
	}
}

export default sql
