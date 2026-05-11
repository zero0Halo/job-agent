import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Job to resume comparison agent",
  instructions: `
You compare the requirements of the passed job description to the candidate information extracted from the resume.

Return a score from 0 to 100 for how well the candidate matches the job description, and explain the reasoning behind the score.

Do not invent details.
`,
});

export async function agentCompareJobToResume({
  jobDescription,
  resumeInfo,
}: {
  jobDescription: string;
  resumeInfo: {
    codingExperience: number;
    managementExperience: number;
    frontendTechnologies: string[];
    backendTechnologies: string[];
    domains: string[];
    strengths: string[];
  };
}) {
  const result = await run(
    agent,
    `
Compare the following job description to the candidate's resume information:

Job Description: ${jobDescription}

Candidate Information: ${JSON.stringify(resumeInfo)}

Return the results in the following JSON format:
{
  "score": 0,
  "reasoning": "",
  "backendTechnologies": [],
  "domains": [],
  "strengths": []
}
`,
  );

  try {
    const parsed = result?.finalOutput
      ? JSON.parse(result.finalOutput)
      : {
          codingExperience: 0,
          managementExperience: 0,
          frontendTechnologies: [],
          backendTechnologies: [],
          domains: [],
          strengths: [],
        };

    console.log("Comparison Complete!");

    return {
      codingExperience: parsed.codingExperience,
      managementExperience: parsed.managementExperience,
      frontendTechnologies: parsed.frontendTechnologies,
      backendTechnologies: parsed.backendTechnologies,
      domains: parsed.domains,
      strengths: parsed.strengths,
    };
  } catch (error) {
    console.error("Error parsing resume information:", error);

    return {
      codingExperience: 0,
      managementExperience: 0,
      frontendTechnologies: [],
      backendTechnologies: [],
      domains: [],
      strengths: [],
    };
  }
}
