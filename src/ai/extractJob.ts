import { Agent, run } from "@openai/agents";
export type DescriptionParse = {
  companyName: string;
  jobTitle: string;
};

const extractJobAgent = new Agent({
  name: "Job extraction agent",
  instructions: `
You extract structured job information from pasted job descriptions.

Return only the company name and job title.
If either value is unclear, use "Unknown".
Do not invent details.
`,
});

export async function extractJob(
  jobDescription: string,
  titleTagText?: string,
): Promise<DescriptionParse> {
  const result = await run(
    extractJobAgent,
    `
Extract the company name from this job description: ${jobDescription}

Then extract the job name from this text: ${titleTagText}

Return the results in the following JavaScript object format:
{
  companyName: "string",
  jobTitle: "string"
}
`,
  );

  console.log(result.finalOutput);

  return {
    companyName: "TODO",
    jobTitle: "TODO",
  };
}
