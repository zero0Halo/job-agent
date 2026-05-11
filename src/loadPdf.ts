import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import fs from "fs";

export async function loadPdf(pdfFilename: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const resumePath = path.join(__dirname, `../resumes/${pdfFilename}`);
  const resumeBuffer = fs.readFileSync(resumePath);
  const resumeParse = new PDFParse({
    data: new Uint8Array(resumeBuffer),
  });
  const resume = await resumeParse.getText();

  return resume.text;
}
