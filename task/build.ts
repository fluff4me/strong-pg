import { Task } from "task";
import ts from "./ts";

export default Task("build", task => task.series(
	ts
));
