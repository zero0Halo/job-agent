import path from "node:path";
import { fileURLToPath } from "node:url";
import { stat, readFile, writeFile, mkdir } from "node:fs/promises";
import fs from "fs";
import { PDFParse } from "pdf-parse";

async function getCache(cachePath: string) {
  try {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));
    return cached;
  } catch {
    return null;
  }
}

export async function loadPdf(pdfFilename: "developer" | "manager") {
  // Create the cached resumes directory if it doesn't exist
  await mkdir("../.cache", { recursive: true });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pdfPath = path.join(__dirname, `../resumes/${pdfFilename}.pdf`);
  const cachePath = path.join(__dirname, `../.cache/${pdfFilename}.json`);
  const pdfStat = await stat(pdfPath);
  const cached = await getCache(cachePath);

  // Cached data is valid, return it
  if (
    cached &&
    cached.source?.mtimeMs === pdfStat.mtimeMs &&
    cached.source?.size === pdfStat.size
  ) {
    console.log(`Loaded ${pdfFilename} resume from cache!\n`);
    return cached.data.text;
  }

  // If the cached data is invalid or doesn't exist, read the PDF, extract the text, cache it, and
  // return the extracted text
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfParse = new PDFParse({
    data: new Uint8Array(pdfBuffer),
  });
  const resume = await pdfParse.getText();

  await writeFile(
    cachePath,
    JSON.stringify(
      {
        source: {
          path: pdfPath,
          mtimeMs: pdfStat.mtimeMs,
          size: pdfStat.size,
        },
        data: resume,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Loaded ${pdfFilename} resume from PDF.\n`);

  return resume;
}
