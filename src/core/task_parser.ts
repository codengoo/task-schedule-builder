import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import { RegistrationInfo, Task, Triggers } from "../interfaces";

const parser = new XMLParser({
    ignoreDeclaration: true,
});

type CompositeKeyNode<T> = {
    name: keyof T;
    keys: AllowedKeyNode<T>[];
}
type AllowedKeyNode<T> =
    | keyof T
    | CompositeKeyNode<T>;

type AllowedKeys<T> = AllowedKeyNode<T>[];

export class TaskParser {
    private task: Task;

    constructor(filePath: string) {
        const content = this.loadFile(filePath);
        if (!content.trim().length) {
            throw new Error("File is empty");
        }

        this.task = this.parseFile(content);
    }

    private loadFile(filePath: string) {
        const content = fs.readFileSync(filePath, "utf-8");
        return content;
    }

    private copyNotNull<T>(data: Partial<T>, keys: AllowedKeys<T>): Partial<T> {
        const result: Partial<T> = {};

        for (const key of keys) {

            // key thường
            if (typeof key === "string") {
                const value = data[key];

                if (value !== undefined) {
                    result[key] = value;
                }

                continue;
            }

            // key object (recursive)
            const childData = data[(key as CompositeKeyNode<T>).name];

            if (childData !== undefined && childData !== null) {

                const nested = this.copyNotNull(
                    childData as any,
                    (key as CompositeKeyNode<T>).keys as any
                );

                if (Object.keys(nested).length > 0) {
                    result[(key as CompositeKeyNode<T>).name] = nested as T[typeof (key as CompositeKeyNode<T>).name];
                }
            }
        }

        return result;
    }

    private parseFile(content: string): Task {
        const result: Task = {
            "@_version": "1.2",
            "@_xmlns": "http://schemas.microsoft.com/windows/2004/02/mit/task",
        }
        const parsed = parser.parse(content);
        if (parsed.Task == undefined) throw new Error("Invalid Task XML");

        const task = parsed.Task;
        if (task.RegistrationInfo)
            result.RegistrationInfo = this.parseRegistrationInfo(task.RegistrationInfo);

        if (task.Triggers)
            result.Triggers = this.parseTriggers(task.Triggers);

        return result;
    }

    private parseRegistrationInfo(registrationInfo: any): RegistrationInfo {
        const keys = [
            "Author",
            "Date",
            "Description",
            "Documentation",
            "SecurityDescriptor",
            "Source",
            "URI",
            "Version",
        ] satisfies (keyof RegistrationInfo)[];

        const info: RegistrationInfo = this.copyNotNull<RegistrationInfo>(
            registrationInfo,
            keys,
        );

        return info;
    }

    private parseTriggers(triggers: any): Triggers {
        const keys = [
            "BootTrigger",
            "CalendarTrigger",
            "IdleTrigger",
            "LogonTrigger",
            "TimeTrigger",
            "RegistrationTrigger",
        ] satisfies (keyof Triggers)[];

        const result: Triggers = this.copyNotNull<Triggers>(triggers, keys);

        return result;
    }

    public getTask(): Task {
        return this.task;
    }
}
