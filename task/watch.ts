import { Task } from "task";
import { tsWatch } from "./ts";

export default Task("watch", task => task.series(
	tsWatch,
));
