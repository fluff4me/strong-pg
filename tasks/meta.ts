import fs from "mz/fs";
import Task from "./utilities/Task";

export default Task("meta", async () => {
	await fs.mkdir("build");

	const packageJson = JSON.parse(await fs.readFile("package.json", "utf8")) as Partial<typeof import("../package.json")>;
	delete packageJson.private;
	delete packageJson.scripts;
	delete packageJson.devDependencies;
	await fs.writeFile("build/package.json", JSON.stringify(packageJson, null, "\t"));

	await fs.copyFile("LICENSE", "build/LICENSE");
	await fs.copyFile("README.md", "build/README.md");
});
