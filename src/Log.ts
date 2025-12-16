import { DatabaseError } from 'pg'

function log (text: string): void
function log (prefix: string, text: string): void
function log (prefix: string, text?: string) {
	if (!process.env.DEBUG_PG)
		return

	if (text === undefined)
		text = prefix, prefix = ''

	// prefix = prefix ? prefix.slice(0, 20).trimEnd() + " " : prefix; // cap prefix length at 20

	const maxLineLength = 150 - prefix.length
	text = text.split('\n')
		.flatMap(line => {
			const lines = []
			while (line.length > maxLineLength) {
				lines.push(line.slice(0, maxLineLength))
				line = line.slice(maxLineLength)
			}
			lines.push(line.trimEnd())
			return lines
		})
		.filter(line => line)
		.map((line, i) => i ? line.padStart(line.length + prefix.length, ' ') : `${prefix}${line}`)
		.join('\n')

	console.log(text)
}

export default log

let ansicolor: typeof import('ansicolor') | undefined
export function color (color: keyof typeof import('ansicolor'), text: string) {
	if (!ansicolor) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			ansicolor = require('ansicolor')
		}
		catch { }

		if (!ansicolor)
			return text
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	return (ansicolor as any)[color](text) as string
}

function isDatabaseError (value: unknown): value is DatabaseError {
	return value instanceof DatabaseError
		|| (typeof value === 'object' && !!value && 'internalQuery' in value)
}

export function getDatabaseErrorDetails (err: Error) {
	if (!isDatabaseError(err))
		return null

	return {
		message: err.message + (err.detail ? `: ${err.detail}` : ''),
		hint: err.hint,
		position: (() => {
			if (!err.position || !err.internalQuery)
				return undefined

			let line: string
			const start = err.internalQuery.lastIndexOf('\n', +err.position) + 1
			const previousLine = err.internalQuery.substring(err.internalQuery.lastIndexOf('\n', start - 2) + 1, start - 1).trim()
			const end = err.internalQuery.indexOf('\n', +err.position)
			line = err.internalQuery.substring(start, end)
			const length = line.length
			line = line.trim()
			const trimmedWhitespace = length - line.length
			const position = +err.position - start - trimmedWhitespace

			let result = ''
			if (previousLine)
				result += `  > ${color('darkGray', previousLine)}\n`

			result += `  > ${line}\n`

			if (position !== undefined)
				result += `    ${' '.repeat(Math.max(0, position)) + color('red', '^')}`

			return result
		})(),
	}
}
