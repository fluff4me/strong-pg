import { Task, TypeScript } from "task"

const ts = Task("ts", task => TypeScript.compile(task, "src", "--pretty"))

export default ts

export const tsWatch = Task("ts (watch)", task => task.series(
	ts,
	() => TypeScript.compile(task, "src", "--watch", "--preserveWatchOutput", "--pretty"),
))
