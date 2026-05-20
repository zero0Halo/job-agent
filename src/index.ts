import dotenv from "dotenv";
import readline from "node:readline/promises";
import fs from "node:fs";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { agentExtractJobData } from "./ai/agentExtractJobData";
import { agentExtractResume } from "./ai/agentExtractResume";
import { agentCompareJobToResumes } from "./ai/agentCompareJobToResumes";
import { outputMarkdown } from "./outputMarkdown";
import { nameToFilename } from "./nameToFilename";
import { loadPdf } from "./loadPdf";
import { agentWriteCoverletter } from "./ai/agentWriteCoverletter";

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
  console.log(comparison);
  // const coverLetter = await agentWriteCoverletter();

  const now = new Date();
  const formattedDate = [
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    now.getFullYear(),
  ].join("-");

  const md = outputMarkdown({
    formattedDate,
    jobTitle: jobTitle,
    companyName: companyName,
    url: payloadParsed.jobUrl,
    comparison,
  });

  if (!fs.existsSync("output")) {
    await mkdir("output", { recursive: true });
  }
  await writeFile(
    `output/${formattedDate}--${nameToFilename(companyName)}--${nameToFilename(jobTitle)}.md`,
    md,
  );

  console.log("Markdown output generated in the output/ directory!");
}

main()
  .catch((error) => {
    console.error("Something went wrong:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
