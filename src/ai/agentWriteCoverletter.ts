import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { Agent, run } from "@openai/agents";
import { AgentExtractResumeSchema } from "./agentExtractResume";

export async function agentWriteCoverletter() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pdfPath = path.join(
    __dirname,
    `../../system/guidelines-coverletter.md`,
  );
  const guidelines = await readFile(pdfPath, "utf8");

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

And here is the job description:
  `,
  );
}
