import { TaskScheduleIO } from "../src/core/task_parser";

const parser = new TaskScheduleIO("test\\fixtures\\test-template.xml");
console.log(parser.getTask());
parser.save("test\\fixtures\\test-template-out.xml");