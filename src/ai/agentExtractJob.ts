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
You extract structured job information from pasted job descriptions.

Return only the company name and job title.
If either value is unclear, use "Unknown".
Do not invent details.
`,
});

export async function agentExtractJob(
  jobDescription?: string,
  titleTagText?: string,
): Promise<AgentExtractJob> {
  const result = await run(
    agent,
    `
Extract the company name from this job description: ${jobDescription}

Then extract the job name from this text: ${titleTagText}
`,
  );

  try {
    const parsed = result?.finalOutput
      ? (result.finalOutput as AgentExtractJob)
      : { companyName: "", jobTitle: "" };

    console.log("Job title extracted!\n");

    return {
      companyName: parsed.companyName,
      jobTitle: parsed.jobTitle,
    };
  } catch (error) {
    console.error("Error parsing job information:", error);

    return { companyName: "", jobTitle: "" };
  }
}
