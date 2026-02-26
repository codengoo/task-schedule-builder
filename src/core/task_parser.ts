import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import { parseXmlString } from "libxmljs2";
import { Task } from "../interfaces";

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

export class TaskScheduleParser {
  private task: Task;
  private readonly xsdPath = new URL(
    "../constants/task.xsd",
    import.meta.url
  ).pathname.slice(1);

  constructor(filePath: string) {
    const content = this.loadFile(filePath);
    if (!content.trim().length) {
      throw new Error("File is empty");
    }

    // Validate XML against XSD schema
    this.validateXML(content);

    // Parse the validated XML
    this.task = this.parseFile(content);
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

  private parseFile(content: string): Task {
    const parsed = parser.parse(content);

    if (!parsed || typeof parsed !== "object" || !("Task" in parsed)) {
      throw new Error("Invalid Task XML structure");
    }

    // Since XSD validation passed, we can trust the structure
    // XMLParser with parseTagValue and parseAttributeValue will handle type conversion
    return parsed.Task as Task;
  }

  public getTask(): Task {
    return this.task;
  }
}
