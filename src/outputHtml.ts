import MarkdownIt from "markdown-it";
import fs from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { nameToFilename } from "./nameToFilename";

const OutputHtmlSchema = z.object({
  md: z.string(),
  companyName: z.string(),
  jobTitle: z.string(),
  formattedDate: z.string(),
});

type OutputHtml = z.infer<typeof OutputHtmlSchema>;

export async function outputHtml({
  md,
  companyName,
  jobTitle,
  formattedDate,
}: OutputHtml): Promise<boolean> {
  try {
    if (!fs.existsSync("output/html")) {
      await mkdir("output/html", { recursive: true });
    }

    const template = await readFile("system/template-job.html", "utf-8");
    const markdown = new MarkdownIt();
    const html = markdown.render(md);
    const renderedTemplate = template
      .replace("{{TITLE}}", `${jobTitle} | ${companyName}`)
      .replace("{{BODY}}", html);

    await writeFile(
      `output/html/${formattedDate}--${nameToFilename(companyName)}--${nameToFilename(jobTitle)}.html`,
      renderedTemplate,
    );

    return true;
  } catch (err) {
    console.error("Error writing HTML file:", err);
    return false;
  }
}
