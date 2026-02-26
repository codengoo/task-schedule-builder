import { TaskScheduleParser } from "../src/core/task_parser";

const parser = new TaskScheduleParser("test\\fixtures\\test-template.xml");
console.log(parser.getTask());