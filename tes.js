import { XMLBuilder, XMLParser } from "fast-xml-parser";
import fs from "node:fs";
const parser = new XMLParser({
  ignoreDeclaration: true,
});

const builder = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
});

const xmlFromFile = fs.readFileSync(
  "test\\fixtures\\test-template.xml",
  "utf-8",
);

const obj = {
  Task: {
    "@_version": "1.2",
    "@_xmlns": "http://schemas.microsoft.com/windows/2004/02/mit/task",

    Actions: {
      Exec: {
        Command: "npm",
      },
    },
  },
};

// Convert ngược lại XML
const xml = builder.build(obj);

console.log(xml);
