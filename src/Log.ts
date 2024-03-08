function log (text: string): void;
function log (prefix: string, text: string): void;
function log (prefix: string, text?: string) {
	if (!process.env.DEBUG_PG)
		return;

	if (text === undefined)
		text = prefix, prefix = "";

	// prefix = prefix ? prefix.slice(0, 20).trimEnd() + " " : prefix; // cap prefix length at 20

	const maxLineLength = 150 - prefix.length;
	text = text.split("\n")
		.flatMap(line => {
			const lines = [];
			while (line.length > maxLineLength) {
				lines.push(line.slice(0, maxLineLength));
				line = line.slice(maxLineLength);
			}
			lines.push(line.trimEnd());
			return lines;
		})
		.filter(line => line)
		.map((line, i) => i ? line.padStart(line.length + prefix.length, " ") : `${prefix}${line}`)
		.join("\n");

	console.log(text);
}

export default log;

let ansicolor: typeof import("ansicolor") | undefined;
export function color (color: keyof typeof import("ansicolor"), text: string) {
	if (!ansicolor) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			ansicolor = require("ansicolor");
			// eslint-disable-next-line no-empty
		} catch { }

		if (!ansicolor)
			return text;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	return (ansicolor as any)[color](text) as string;
}
