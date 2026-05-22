import MarkdownIt from "markdown-it";
import fs from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import { nameToFilename } from "./nameToFilename";

export const MatchSchema = z.object({
  jobRequirement: z.string(),
  candidateEvidence: z.string(),
  confidence: z.enum(["strong", "weak", "missing"]),
});

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
    if (!fs.existsSync("../output/html")) {
      await mkdir("../output/html", { recursive: true });
    }

    const markdown = new MarkdownIt();
    const html = markdown.render(md);

    await writeFile(
      `../output/html/${formattedDate}--${nameToFilename(companyName)}--${nameToFilename(jobTitle)}.html`,
      html,
    );

    return true;
  } catch (err) {
    console.error("Error writing HTML file:", err);
    return false;
  }
}
