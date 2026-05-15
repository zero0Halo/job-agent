import { Agent, run } from "@openai/agents";

const attempts = 3;
let count = 0;

const agent = new Agent({
  name: "Job to resume comparison agent",
  instructions: `
You compare the requirements of the passed job description to the candidate information extracted from the resume.

Return a score from 0 to 100 for how well the candidate matches the job description, and explain the reasoning behind the score.

Do not wrap the results in markdown.

Do not invent details.
`,
});

export async function agentCompareJobToResumes({
  jobDescription,
  developerInfo,
  managerInfo,
}: {
  jobDescription: string;
  developerInfo: any;
  managerInfo: any;
}) {
  const result = await run(
    agent,
    `
Compare both resumes against the job.
Choose which resume is stronger for this specific role.
You must explain why one is better than the other.
Do not give the same score unless they are genuinely indistinguishable.
Compare the following job description to the candidate's resume information:

Job Description: ${jobDescription}

Manager Resume Information: ${JSON.stringify(managerInfo)}

Developer Resume Information: ${JSON.stringify(developerInfo)}

Do not wrap the results in markdown.
Return the results in the following JSON format:

{
  "score": 0,
  "summary": "",
  "strongMatches": [
    {
      "jobRequirement": "",
      "candidateEvidence": "",
      "confidence": "high"
    }
  ],
  "weakMatches": [
    {
      "jobRequirement": "",
      "candidateGap": "",
      "impact": "low"
    }
  ],
  "missingRequirements": [],
  "recommendedResume": "developer | manager | unknown"
}
`,
  );

  try {
    const parsed = result?.finalOutput
      ? JSON.parse(result.finalOutput)
      : {
          score: 0,
          summary: "",
          strongMatches: [],
          weakMatches: [],
          missingRequirements: [],
          recommendedResume: "developer | manager | unknown",
        };

    console.log("\nComparison Complete!\n");

    return {
      score: parsed.score,
      summary: parsed.summary,
      strongMatches: parsed.strongMatches,
      weakMatches: parsed.weakMatches,
      missingRequirements: parsed.missingRequirements,
      recommendedResume: parsed.recommendedResume,
    };
  } catch (error) {
    if (count < attempts) {
      console.error(
        `Error parsing resume information. Trying again (${count + 1})`,
      );
      count++;

      return await agentCompareJobToResumes({
        jobDescription,
        developerInfo,
        managerInfo,
      });
    }

    console.error("Error parsing resume information: ", error);

    return {
      score: 0,
      summary: "",
      strongMatches: [],
      weakMatches: [],
      missingRequirements: [],
      recommendedResume: "",
    };
  }
}
