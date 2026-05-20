import { Agent, run } from "@openai/agents";
import { z } from "zod";

export const AgentExtractJobSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
});

export type AgentExtractJob = z.infer<typeof AgentExtractJobSchema>;

const agent = new Agent({
  name: "Job extraction agent",
  outputType: AgentExtractJobSchema,
  instructions: `
You extract the companyName and jobTitle from a job description and page title.

Return only the company name and job title.
If either value is unclear, use "Unknown".
Do not invent details.
`,
});

export async function agentExtractJob(
  jobDescription?: string,
  pageTitle?: string,
): Promise<AgentExtractJob> {
  const result = await run(
    agent,
    `
jobDescription: ${jobDescription}

pageTitle: ${pageTitle}

Extract the company name from either the job description and/or the page title.

Then extract the job title from the pageTitle.
`,
  );

  try {
    const parsed = result?.finalOutput
      ? (result.finalOutput as AgentExtractJob)
      : { companyName: "", jobTitle: "" };

    console.log("Job title and Company name extracted!\n");

    return {
      companyName: parsed.companyName,
      jobTitle: parsed.jobTitle,
    };
  } catch (error) {
    console.error("Error parsing job information:", error);

    return { companyName: "", jobTitle: "" };
  }
}
