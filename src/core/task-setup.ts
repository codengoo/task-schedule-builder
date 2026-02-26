import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { Task } from "../interfaces";
import type { ExecutionResult } from "../types";
import { TaskScheduleController } from "./task-controller";

const execAsync = promisify(exec);

export interface TaskRegistrationOptions {
    force?: boolean;
    runAsSystem?: boolean;
    user?: string;
    password?: string;
}

/**
 * High-level controller for loading Task XML definitions and registering them with schtasks.
 */
export class TaskSchedulerSetup {
    private readonly taskIO: TaskScheduleController;

    constructor(source: string | TaskScheduleController) {
        this.taskIO = typeof source === "string" ? new TaskScheduleController(source) : source;
    }

    /**
     * Register or update the task within Windows Task Scheduler using schtasks.
     *
     * @param taskName Optional explicit task name. Falls back to RegistrationInfo.URI when omitted.
     */
    public async register(taskName?: string, options?: TaskRegistrationOptions): Promise<ExecutionResult> {
        const task = this.ensureTask();
        const resolvedName = taskName ?? task.RegistrationInfo?.URI;

        if (!resolvedName) {
            throw new Error(
                "Task name is required. Provide a taskName or ensure RegistrationInfo.URI is set."
            );
        }

        if (options?.runAsSystem && options?.user) {
            throw new Error("Cannot specify both runAsSystem and a custom user.");
        }

        if (options?.password && !options?.user) {
            throw new Error("A password was provided without a matching user option.");
        }

        const xmlPath = this.createTempXml(task);

        try {
            const command = this.buildCommand(resolvedName, xmlPath, options);
            const { stdout, stderr } = await execAsync(command);
            return {
                success: true,
                output: stdout,
                error: stderr || undefined,
            };
        } catch (error: any) {
            return {
                success: false,
                output: "",
                error: error?.message ?? String(error),
            };
        } finally {
            await this.deleteTempFile(xmlPath);
        }
    }

    private ensureTask(): Task {
        const task = this.taskIO.getTask();
        if (!task) {
            throw new Error("No task has been loaded. Load or set a task before registering.");
        }
        return task;
    }

    private createTempXml(task: Task): string {
        const tempPath = join(tmpdir(), `task-${Date.now()}-${randomUUID()}.xml`);
        TaskScheduleController.saveFile(task, tempPath);
        return tempPath;
    }

    private async deleteTempFile(filePath: string): Promise<void> {
        try {
            await unlink(filePath);
        } catch {
            // ignore cleanup errors
        }
    }

    private buildCommand(name: string, xmlPath: string, options?: TaskRegistrationOptions): string {
        const segments: string[] = [
            "/Create",
            `/TN "${this.escapeQuotes(name)}"`,
            `/XML "${this.escapeQuotes(xmlPath)}"`,
        ];

        if (options?.force) {
            segments.push("/F");
        }

        if (options?.runAsSystem) {
            segments.push("/RU SYSTEM");
        }

        if (options?.user) {
            segments.push(`/RU "${this.escapeQuotes(options.user)}"`);
        }

        if (options?.password) {
            segments.push(`/RP "${this.escapeQuotes(options.password)}"`);
        }

        return `schtasks ${segments.join(" ")}`;
    }

    private escapeQuotes(value: string): string {
        return value.replace(/"/g, '\\"');
    }
}
