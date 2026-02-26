import fs from "fs";
import libxml from "libxmljs2";

const xsd = fs.readFileSync("src\\constants\\task.xsd", "utf8");
const xml = fs.readFileSync("test\\fixtures\\test-template.xml", "utf8");

const xsdDoc = libxml.parseXml(xsd);
const xmlDoc = libxml.parseXml(xml);

const valid = xmlDoc.validate(xsdDoc);

if (!valid) {
  console.log(xmlDoc.validationErrors);
} else {
  console.log("XML valid");
}
