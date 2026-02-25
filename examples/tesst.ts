import { TaskParser } from "../src/core/task_parser";

const parser = new TaskParser("test.xml");
console.log(parser.getTask());