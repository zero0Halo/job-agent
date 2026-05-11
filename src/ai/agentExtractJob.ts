import { Agent, run } from "@openai/agents";
export type DescriptionParse = {
  companyName?: string;
  jobTitle?: string;
};

const agent = new Agent({
  name: "Job extraction agent",
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
): Promise<DescriptionParse> {
  const result = await run(
    agent,
    `
Extract the company name from this job description: ${jobDescription}

Then extract the job name from this text: ${titleTagText}

Return the results in the following JSON format:
{
  "companyName": "string",
  "jobTitle": "string"
}
`,
  );

  try {
    const parsed = result?.finalOutput
      ? JSON.parse(result.finalOutput)
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
