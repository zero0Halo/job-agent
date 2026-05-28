import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { Agent, run } from "@openai/agents";
import { AgentCompareJobToResumes } from "./agentCompareJobToResumes";

export async function agentWriteCoverletter({
  comparison,
  jobDescription,
}: {
  comparison: AgentCompareJobToResumes;
  jobDescription: string;
}): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const mdPath = path.join(
    __dirname,
    `../../system/guidelines/guidelines-coverletter.md`,
  );
  const guidelines = await readFile(mdPath, "utf8");

  const agent = new Agent({
    name: "Write a cover letter",
    instructions: `
Write a coverletter using the data from the resume, job description, and the guidelines below.
  `,
  });

  const result = await run(
    agent,
    `
Adhere to the following guidelines when writing the cover letter:
${guidelines}

Here is the resume:
${comparison.resumeData}

And here is the job description:
${jobDescription}

Write a cover letter that best matches the resume to the job description, following the guidelines.
Use Markdown formatting, but do not wrap the cover letter in markdown.

Do not create a signature at the bottom.
  `,
  );

  return result?.finalOutput ?? "";
}
