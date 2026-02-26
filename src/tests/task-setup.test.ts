import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskScheduleController } from "../core/task-controller";
import type { Task } from "../interfaces";

const mockState = vi.hoisted(() => ({
  execAsyncMock: vi.fn(),
  unlinkMock: vi.fn(),
}));

vi.mock("node:util", () => ({
  promisify: vi.fn(() => mockState.execAsyncMock),
}));

vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  unlink: mockState.unlinkMock,
}));

vi.mock("node:os", () => ({
  tmpdir: vi.fn(() => "C:/temp"),
}));

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => "uuid-123"),
}));

import { TaskSchedulerSetup } from "../core/task-setup";

const createTask = (uri = "\\MyTask"): Task => ({
  RegistrationInfo: { URI: uri },
  Actions: {
    Exec: {
      Command: "notepad.exe",
    },
  },
});

describe("TaskSchedulerSetup", () => {
  beforeEach(() => {
    mockState.execAsyncMock.mockReset();
    mockState.unlinkMock.mockReset();
    mockState.unlinkMock.mockResolvedValue(undefined);
    vi.spyOn(Date, "now").mockReturnValue(1234567890);
    vi.spyOn(TaskScheduleController, "saveFile").mockImplementation(() => {});
  });

  it("throws if no task is loaded", async () => {
    const setup = new TaskSchedulerSetup({
      getTask: () => undefined,
    } as unknown as TaskScheduleController);

    await expect(setup.register("MyTask")).rejects.toThrow(
      "No task has been loaded. Load or set a task before registering.",
    );
  });

  it("uses RegistrationInfo.URI when taskName is omitted", async () => {
    mockState.execAsyncMock.mockResolvedValue({ stdout: "ok", stderr: "" });

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask("\\Folder\\SampleTask"),
    } as unknown as TaskScheduleController);

    const result = await setup.register();

    expect(result).toEqual({ success: true, output: "ok", error: undefined });
    expect(mockState.execAsyncMock).toHaveBeenCalledWith(
      expect.stringContaining('/TN "\\Folder\\SampleTask"'),
    );
  });

  it("rejects invalid option combination runAsSystem + user", async () => {
    const setup = new TaskSchedulerSetup({
      getTask: () => createTask(),
    } as unknown as TaskScheduleController);

    await expect(
      setup.register("MyTask", { runAsSystem: true, user: "admin" }),
    ).rejects.toThrow("Cannot specify both runAsSystem and a custom user.");
  });

  it("rejects password without user", async () => {
    const setup = new TaskSchedulerSetup({
      getTask: () => createTask(),
    } as unknown as TaskScheduleController);

    await expect(
      setup.register("MyTask", { password: "secret" }),
    ).rejects.toThrow(
      "A password was provided without a matching user option.",
    );
  });

  it("builds schtasks command with options and escapes quotes", async () => {
    mockState.execAsyncMock.mockResolvedValue({
      stdout: "created",
      stderr: "warn",
    });

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask(),
    } as unknown as TaskScheduleController);

    const result = await setup.register('My "Task"', {
      force: true,
      user: 'domain\\user"quoted',
      password: 'pw"123',
    });

    const command = mockState.execAsyncMock.mock.calls[0][0] as string;

    expect(result).toEqual({
      success: true,
      output: "created",
      error: "warn",
    });
    expect(command).toContain("schtasks /Create");
    expect(command).toContain('/TN "My \\"Task\\""');
    expect(command).toContain("task-1234567890-uuid-123.xml");
    expect(command).toContain("/F");
    expect(command).toContain('/RU "domain\\user\\"quoted"');
    expect(command).toContain('/RP "pw\\"123"');
    expect(mockState.unlinkMock).toHaveBeenCalledWith(
      expect.stringContaining("task-1234567890-uuid-123.xml"),
    );
  });

  it("returns failed result when schtasks execution fails and still cleans up temp file", async () => {
    mockState.execAsyncMock.mockRejectedValue(new Error("schtasks failed"));

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask(),
    } as unknown as TaskScheduleController);

    const result = await setup.register("MyTask", { runAsSystem: true });

    expect(result).toEqual({
      success: false,
      output: "",
      error: "schtasks failed",
    });
    expect(mockState.execAsyncMock).toHaveBeenCalledWith(
      expect.stringContaining("/RU SYSTEM"),
    );
    expect(mockState.unlinkMock).toHaveBeenCalledWith(
      expect.stringContaining("task-1234567890-uuid-123.xml"),
    );
  });
});
