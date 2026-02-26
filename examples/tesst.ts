import { TaskScheduleIO } from "../src/core/task_parser";

const parser = new TaskScheduleIO("test\\fixtures\\test-template.xml");
console.log(parser.getTask());

// Option A: deep-merge partial updates (recommended for nested fields)
parser.updateTask({ RegistrationInfo: { Description: "Updated description" } });

// Option B: mutate the reference directly
// const task = parser.getTask();
// task.RegistrationInfo!.Description = "Updated description";

// Option C: replace the entire task object
// parser.setTask({ ...parser.getTask(), /* overrides */ } as any);

// Save the modified task back to XML
parser.saveTask("test\\fixtures\\test-template-out.xml");