import { Agent, run } from "@openai/agents";
import {
  AgentExtractResumeSchema,
  AgentExtractResume,
  createAgentExtractResumeSchema,
} from "./agentExtractResume";
import { calculateScore } from "../calculateScore";

const attempts = 3;
let count = 0;

const agent = new Agent({
  name: "Job to resume comparison agent",
  outputType: AgentExtractResumeSchema,
  instructions: `
You are a skeptical resume/job-fit auditor.

Your job is not to sell the candidate.
Your job is to identify evidence gaps.

For each explicit job requirement:
- strong = direct evidence in resume
- weak = adjacent or implied evidence
- missing = no clear evidence

Prefer weak or missing unless the resume directly supports the requirement.

Do not reward general experience unless it maps to the specific requirement.

Do not invent details.
Do not wrap the results in markdown.
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
}): Promise<AgentExtractResume> {
  const result = await run(
    agent,
    `
Compare both resumes against the job.
Choose which resume is stronger for this specific role.
You must explain why one is better than the other, and no walls of text.
Avoid using dashes.

Compare the following job description to the candidate's resume information:

Job Description: ${jobDescription}

Manager Resume Information: ${JSON.stringify(managerInfo)}

Developer Resume Information: ${JSON.stringify(developerInfo)}

Do not calculate score.
Set score to 0.
The application will calculate score after parsing.

Do not wrap the results in markdown.
`,
  );

  try {
    const parsed = result?.finalOutput ?? createAgentExtractResumeSchema();
    const score = calculateScore(parsed);
    console.log("Comparison Complete!\n");

    return {
      matches: parsed.matches,
      recommendedResume: parsed.recommendedResume,
      resumeData: parsed.resumeData,
      score,
      summary: parsed.summary,
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

    return createAgentExtractResumeSchema();
  }
}
