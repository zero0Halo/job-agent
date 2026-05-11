import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Resume extraction agent",
  instructions: `
You extract structured candidate information from this resume:

Return only the company name and job title.
If either value is unclear, use "Unknown".
Do not invent details.
`,
});

export async function agentExtractResume(resume?: string) {
  const result = await run(
    agent,
    `
Extract the following information from this resume: ${resume}

Return the results in the following JSON format:
{
  "codingExperience": 0,
  "managementExperience": 0,
  "frontendTechnologies": [],
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

    console.log("Resume information extracted!");

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
