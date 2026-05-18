import path from "node:path";
import { fileURLToPath } from "node:url";
import { stat, readFile, writeFile, mkdir } from "node:fs/promises";
import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function loadPdf(pdfFilename: "developer" | "manager") {
  // Create the cached resumes directory if it doesn't exist
  await mkdir("../.cache", { recursive: true });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pdfPath = path.join(__dirname, `../resumes/${pdfFilename}.pdf`);
  const cachePath = path.join(__dirname, `../.cache/${pdfFilename}.json`);
  const pdfStat = await stat(pdfPath);

  try {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));

    // If there is a cached version of the extracted resume info and the PDF hasn't changed since
    // we cached it, return the cached data
    if (
      cached.source?.mtimeMs === pdfStat.mtimeMs &&
      cached.source?.size === pdfStat.size
    ) {
      return cached.data;
    }

    // If the PDF has changed or it never existed, write to cache and return its data
    if (cached.data === null) {
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

      return resume;
    }
  } catch (err) {
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

    return resume;
  }

  return false;
}
