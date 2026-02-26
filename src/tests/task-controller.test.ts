import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../interfaces";

const mockState = vi.hoisted(() => ({
  fileContents: new Map<string, string>(),
  xmlIsValid: true,
  writeFileSyncMock: vi.fn(),
}));

vi.mock("fs", () => {
  const readFileSync = vi.fn((filePath: string) => {
    if (filePath.includes("task.xsd")) {
      return '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';
    }
    return mockState.fileContents.get(filePath) ?? "";
  });

  return {
    default: {
      readFileSync,
      writeFileSync: mockState.writeFileSyncMock,
    },
    readFileSync,
    writeFileSync: mockState.writeFileSyncMock,
  };
});

vi.mock("libxmljs2", () => ({
  parseXmlString: vi.fn((content: string) => {
    if (content.includes("xs:schema")) {
      return { kind: "xsd" };
    }

    return {
      validate: vi.fn(() => mockState.xmlIsValid),
      validationErrors: mockState.xmlIsValid
        ? []
        : [{ message: "schema mismatch" }],
    };
  }),
}));

import { TaskScheduleController } from "../core/task-controller";

const VALID_XML = `<?xml version="1.0" encoding="UTF-16"?>
<Task>
  <RegistrationInfo>
    <URI>\\MyTask</URI>
  </RegistrationInfo>
  <Actions>
    <Exec>
      <Command>notepad.exe</Command>
    </Exec>
  </Actions>
</Task>`;

const baseTask: Task = {
  RegistrationInfo: {
    URI: "\\BaseTask",
  },
  Actions: {
    Exec: {
      Command: "notepad.exe",
    },
  },
};

describe("TaskScheduleController", () => {
  beforeEach(() => {
    mockState.fileContents.clear();
    mockState.xmlIsValid = true;
    mockState.writeFileSyncMock.mockReset();
  });

  it("parseFile parses a valid Task XML", () => {
    const parsed = TaskScheduleController.parseFile(VALID_XML);

    expect(parsed.RegistrationInfo?.URI).toBe("\\MyTask");
    expect(parsed.Actions.Exec).toMatchObject({ Command: "notepad.exe" });
  });

  it("parseFile throws for invalid XML structure", () => {
    expect(() =>
      TaskScheduleController.parseFile("<Invalid></Invalid>"),
    ).toThrow("Invalid Task XML structure");
  });

  it("toXmlString includes declaration and task payload", () => {
    const xml = TaskScheduleController.toXmlString(baseTask);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-16"?>');
    expect(xml).toContain("<Command>notepad.exe</Command>");
  });

  it("constructor without file keeps task undefined", () => {
    const controller = new TaskScheduleController();
    expect(controller.getTask()).toBeUndefined();
  });

  it("constructor throws when source file is empty", () => {
    mockState.fileContents.set("empty.xml", "   ");

    expect(() => new TaskScheduleController("empty.xml")).toThrow(
      "File is empty",
    );
  });

  it("constructor loads, validates and parses task from file", () => {
    mockState.fileContents.set("valid.xml", VALID_XML);

    const controller = new TaskScheduleController("valid.xml");

    expect(controller.getTask()?.RegistrationInfo?.URI).toBe("\\MyTask");
  });

  it("setTask validates XML before setting", () => {
    const controller = new TaskScheduleController();
    controller.setTask(baseTask);
    expect(controller.getTask()?.RegistrationInfo?.URI).toBe("\\BaseTask");

    mockState.xmlIsValid = false;

    expect(() => controller.setTask(baseTask)).toThrow("XML validation error");
  });

  it("updateTask throws when no task is loaded", () => {
    const controller = new TaskScheduleController();
    expect(() =>
      controller.updateTask({ RegistrationInfo: { Description: "x" } }),
    ).toThrow("No task loaded to update");
  });

  it("updateTask deep-merges updates and keeps existing fields", () => {
    const controller = new TaskScheduleController();
    controller.setTask(baseTask);

    controller.updateTask({
      RegistrationInfo: {
        Description: "updated",
      },
    });

    expect(controller.getTask()?.RegistrationInfo).toMatchObject({
      URI: "\\BaseTask",
      Description: "updated",
    });
  });

  it("saveTask writes utf-16 XML when task is loaded", () => {
    const controller = new TaskScheduleController();
    controller.setTask(baseTask);

    controller.saveTask("out.xml");

    expect(mockState.writeFileSyncMock).toHaveBeenCalledWith(
      "out.xml",
      expect.stringContaining("<Task"),
      "utf-16le",
    );
  });

  it("saveTask throws when task is not loaded", () => {
    const controller = new TaskScheduleController();
    expect(() => controller.saveTask("out.xml")).toThrow(
      "No task loaded to save",
    );
  });
});
