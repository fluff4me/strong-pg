import { QueryConfig } from "pg"

export function sql (segments: TemplateStringsArray, ...interpolations: any[]): QueryConfig {
	let text = segments[0]
	for (let i = 0; i < interpolations.length; i++)
		text += `$${i + 1}${segments[i + 1]}`
	return { text, values: interpolations }
}
