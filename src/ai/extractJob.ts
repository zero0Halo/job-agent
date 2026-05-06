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
  description: string,
): Promise<DescriptionParse> {
  const result = await run(
    extractJobAgent,
    `
Extract the company name and job title from this job description:

${description}
`,
  );

  console.log(result.finalOutput);

  return {
    companyName: "TODO",
    jobTitle: "TODO",
  };
}
