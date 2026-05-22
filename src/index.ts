import dotenv from "dotenv";
import readline from "node:readline/promises";
import fs from "node:fs";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
// AGENTS
import { agentExtractJobData } from "./ai/agentExtractJobData";
import { agentCompareJobToResumes } from "./ai/agentCompareJobToResumes";
import { agentExtractResume } from "./ai/agentExtractResume";
import { agentWriteCoverletter } from "./ai/agentWriteCoverletter";
// SCRIPTS
import { loadPdf } from "./loadPdf";
import { nameToFilename } from "./nameToFilename";
import { outputMarkdown } from "./outputMarkdown";
import { outputHtml } from "./outputHtml";

// Loads environment variables from .env file
dotenv.config();

const rl = readline.createInterface({ input, output });

const PayloadSchema = z.object({
  pageTitle: z.string(),
  jobDescription: z.string(),
  jobUrl: z.string(),
});
type Payload = z.infer<typeof PayloadSchema>;

async function main() {
  const payload = await rl.question("Paste the Payload from the Bookmarklet:");
  let payloadParsed: Payload;

  try {
    console.log("\nPayload received!\n");
    payloadParsed = JSON.parse(payload.trim());
    console.log("Payload parsed successfully!\n");
  } catch (error) {
    console.error("Error parsing payload:", error);
    process.exitCode = 1;
    return;
  }

  const { companyName, jobTitle } = await agentExtractJobData(
    payloadParsed.jobDescription,
    payloadParsed.pageTitle,
  );

  const developerResume = await loadPdf("developer");
  const managerResume = await loadPdf("manager");
  const developerInfo = await agentExtractResume(developerResume);
  const managerInfo = await agentExtractResume(managerResume);
  const comparison = await agentCompareJobToResumes({
    jobDescription: payloadParsed.jobDescription,
    developerInfo,
    managerInfo,
  });
  const coverLetter = await agentWriteCoverletter({
    comparison,
    jobDescription: payloadParsed.jobDescription,
  });

  const now = new Date();
  const formattedDate = [
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    now.getFullYear(),
  ].join("-");

  const md = outputMarkdown({
    companyName: companyName,
    coverLetter,
    comparison,
    formattedDate,
    jobTitle: jobTitle,
    url: payloadParsed.jobUrl,
  });

  if (!fs.existsSync("output")) {
    await mkdir("output", { recursive: true });
  }
  await writeFile(
    `output/${formattedDate}--${nameToFilename(companyName)}--${nameToFilename(jobTitle)}.md`,
    md,
  );
  console.log("Markdown output generated in the output/ directory!\n");

  const html = await outputHtml({ md, companyName, jobTitle, formattedDate });

  if (html) {
    console.log("HTML output generated in the output/html/ directory!\n");
  } else {
    console.error("Failed to generate HTML output.\n");
  }
}

main()
  .catch((error) => {
    console.error("Something went wrong:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
