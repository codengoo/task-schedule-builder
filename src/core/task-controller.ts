import { XMLBuilder, XMLParser } from "fast-xml-parser";
import fs from "fs";
import { parseXmlString } from "libxmljs2";
import { Task } from "../interfaces";
import type { DeepPartial } from "../types";
import { deepMerge } from "../utils/parser_utils";

const parser = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: true,
    numberParseOptions: {
        hex: false,
        leadingZeros: false,
    },
});

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
});
export class TaskScheduleController {
    private task?: Task;
    private readonly xsdPath = new URL(
        "../constants/task.xsd",
        import.meta.url
    ).pathname.slice(1);

    constructor(filePath?: string) {
        if (!filePath) return;

        const content = this.loadFile(filePath);
        if (!content.trim().length) {
            throw new Error("File is empty");
        }

        // Validate XML against XSD schema
        this.validateXML(content);

        // Parse the validated XML
        this.task = TaskScheduleController.parseFile(content);
    }

    static parseFile(content: string): Task {
        const parsed = parser.parse(content);

        if (!parsed || typeof parsed !== "object" || !("Task" in parsed)) {
            throw new Error("Invalid Task XML structure");
        }

        // Since XSD validation passed, we can trust the structure
        // XMLParser with parseTagValue and parseAttributeValue will handle type conversion
        return parsed.Task as Task;
    }

    static toXmlString(task: Task): string {
        const xmlContent = builder.build({ Task: task });
        const xmlDeclaration = '<?xml version="1.0" encoding="UTF-16"?>';
        return `${xmlDeclaration}\n${xmlContent}`;
    }

    static saveFile(task: Task, filePath: string): void {
        const xmlContent = TaskScheduleController.toXmlString(task);
        fs.writeFileSync(filePath, xmlContent, "utf-16le");
    }


    private loadFile(filePath: string): string {
        return fs.readFileSync(filePath, "utf-8");
    }

    private validateXML(xmlContent: string): void {
        try {
            // Load XSD schema
            const xsdContent = fs.readFileSync(this.xsdPath, "utf-8");
            const xsdDoc = parseXmlString(xsdContent);

            // Parse XML document
            const xmlDoc = parseXmlString(xmlContent);

            // Validate XML against XSD
            const isValid = xmlDoc.validate(xsdDoc);

            if (!isValid) {
                const errors = xmlDoc.validationErrors.map((err) => err.message).join("\n");
                throw new Error(`XML validation failed:\n${errors}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`XML validation error: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get current task object.
     * @returns The current task object.
     */
    public getTask(): Task | undefined {
        return this.task;
    }

    /**
     * Replace the entire task object.
     * @param task The new task object.
     */
    public setTask(task: Task): void {
        const xmlContent = TaskScheduleController.toXmlString(task);
        this.validateXML(xmlContent);
        this.task = task;
    }

    /**
     * Deep-merge partial updates into the current task.
     * Useful for modifying nested fields without replacing the whole object.
     *
     * @example
     * parser.updateTask({ RegistrationInfo: { Description: "Updated" } });
     */
    public updateTask(updates: DeepPartial<Task>): void {
        if (!this.task) {
            throw new Error("No task loaded to update");
        }
        // Work on a snapshot so failed validation never mutates the original task
        const taskSnapshot: Task = JSON.parse(JSON.stringify(this.task));
        const mergedTask = deepMerge(taskSnapshot, updates);
        const xmlContent = TaskScheduleController.toXmlString(mergedTask);
        this.validateXML(xmlContent);
        this.task = mergedTask;
    }


    /**
     * Save the current task to a file.
     * @param filePath The path to the file where the task should be saved.
     */
    public saveTask(filePath: string): void {
        if (!this.task) {
            throw new Error("No task loaded to save");
        }
        TaskScheduleController.saveFile(this.task, filePath);
    }
}
