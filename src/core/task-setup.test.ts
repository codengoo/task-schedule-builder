import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../interfaces";
import { TaskScheduleController } from "./task-controller";

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

import { TaskSchedulerSetup } from "./task-setup";

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

  it("deregister removes task by explicit name", async () => {
    mockState.execAsyncMock.mockResolvedValue({
      stdout: "deleted",
      stderr: "",
    });

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask(),
    } as unknown as TaskScheduleController);

    const result = await setup.deregister("\\Folder\\MyTask");

    expect(result).toEqual({
      success: true,
      output: "deleted",
      error: undefined,
    });
    expect(mockState.execAsyncMock).toHaveBeenCalledWith(
      'schtasks /Delete /TN "\\Folder\\MyTask" /F',
    );
  });

  it("deregister falls back to RegistrationInfo.URI", async () => {
    mockState.execAsyncMock.mockResolvedValue({
      stdout: "deleted",
      stderr: "",
    });

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask("\\URI\\Task"),
    } as unknown as TaskScheduleController);

    const result = await setup.deregister();

    expect(result.success).toBe(true);
    expect(mockState.execAsyncMock).toHaveBeenCalledWith(
      'schtasks /Delete /TN "\\URI\\Task" /F',
    );
  });

  it("register deletes existing task before creating", async () => {
    mockState.execAsyncMock
      .mockResolvedValueOnce({ stdout: "exists", stderr: "" })
      .mockResolvedValueOnce({ stdout: "deleted", stderr: "" })
      .mockResolvedValueOnce({ stdout: "created", stderr: "" });

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask("\\MyTask"),
    } as unknown as TaskScheduleController);

    const result = await setup.register();

    expect(result).toEqual({
      success: true,
      output: "created",
      error: undefined,
    });
    expect(mockState.execAsyncMock).toHaveBeenNthCalledWith(
      1,
      'schtasks /Query /TN "\\MyTask"',
    );
    expect(mockState.execAsyncMock).toHaveBeenNthCalledWith(
      2,
      'schtasks /Delete /TN "\\MyTask" /F',
    );
    expect(mockState.execAsyncMock.mock.calls[2][0]).toContain(
      "schtasks /Create",
    );
  });

  it("register creates directly when task does not exist", async () => {
    mockState.execAsyncMock
      .mockRejectedValueOnce(new Error("not found"))
      .mockResolvedValueOnce({ stdout: "created", stderr: "" });

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask("\\MyTask"),
    } as unknown as TaskScheduleController);

    const result = await setup.register();

    expect(result.success).toBe(true);
    expect(mockState.execAsyncMock).toHaveBeenCalledTimes(2);
    expect(mockState.execAsyncMock).toHaveBeenNthCalledWith(
      1,
      'schtasks /Query /TN "\\MyTask"',
    );
    expect(mockState.execAsyncMock.mock.calls[1][0]).toContain(
      "schtasks /Create",
    );
  });

  it("register fails when delete existing task fails", async () => {
    mockState.execAsyncMock
      .mockResolvedValueOnce({ stdout: "exists", stderr: "" })
      .mockRejectedValueOnce(new Error("delete denied"));

    const setup = new TaskSchedulerSetup({
      getTask: () => createTask("\\MyTask"),
    } as unknown as TaskScheduleController);

    const result = await setup.register();

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to remove existing task");
    expect(result.error).toContain("delete denied");
    expect(mockState.execAsyncMock).toHaveBeenCalledTimes(2);
  });

  it("register still validates option conflicts", async () => {
    const setup = new TaskSchedulerSetup({
      getTask: () => createTask(),
    } as unknown as TaskScheduleController);

    await expect(
      setup.register("MyTask", { runAsSystem: true, user: "admin" }),
    ).rejects.toThrow("Cannot specify both runAsSystem and a custom user.");
  });
});
