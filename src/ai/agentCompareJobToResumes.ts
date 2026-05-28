import { Agent, run } from "@openai/agents";
import { calculateScore } from "../calculateScore";
import { z } from "zod";

const MatchSchema = z.object({
  jobRequirement: z.string(),
  candidateEvidence: z.string(),
  confidence: z.enum(["strong", "weak", "missing"]),
  importance: z.enum(["critical", "important", "neutral"]),
});

export const AgentCompareJobToResumesSchema = z.object({
  companySummary: z.string(),
  matches: z.array(MatchSchema),
  reasonRecommendedResume: z.string(),
  reasonWhyMe: z.string(),
  recommendedResume: z.enum(["developer", "manager", "unknown"]),
  resumeData: z.string().nullable(),
  score: z.number(),
});
export type AgentCompareJobToResumes = z.infer<
  typeof AgentCompareJobToResumesSchema
>;

function createAgentCompareJobToResumes(): AgentCompareJobToResumes {
  return {
    companySummary: "",
    matches: [],
    reasonRecommendedResume: "",
    reasonWhyMe: "",
    recommendedResume: "unknown",
    resumeData: null,
    score: 0,
  };
}

const attempts = 3;
let count = 0;

const agent = new Agent({
  name: "Job to resume comparison agent",
  outputType: AgentCompareJobToResumesSchema,
  instructions: `
You are a skeptical resume/job-fit auditor.

Your job is to evaluate evidence, not sell the candidate.

For each explicit job requirement:
- strong = explicit and convincing evidence in the resume
- weak = partial, implied, adjacent, or ambiguous evidence
- missing = no meaningful evidence

Strong matches require a high burden of proof.

If the requirement is inferred, adjacent, partially supported, or unclear, classify it as weak.

If the resume does not clearly demonstrate the requirement, classify it as missing.

Prefer weak or missing over unsupported strong matches.

Do not infer expertise from:
- job titles
- seniority
- adjacent technologies
- company reputation
- generalized experience

Direct evidence requires explicit mention of the relevant:
- technology
- responsibility
- domain knowledge
- outcome

Do not invent details.
Do not use optimism or overall vibes when evaluating requirements.
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
}): Promise<AgentCompareJobToResumes> {
  const result = await run(
    agent,
    `
Compare both resumes against the job requirements.

Choose the resume with the strongest evidence-based alignment to the role.

Base the decision on:
- number of strong matches
- number of weak matches
- number of missing requirements

Weak matches are not equivalent to strong matches.

Do not use holistic impressions or optimism to influence the recommendation.

Once analyzed, provide 1 sentence summary of the following:
- What does the company do?
- Why was the recommended resume chosen?
- How do I fit with the job and company based on the job description and my resume information?

Keep explanations concise.
Avoid walls of text.
No markdown.
No dashes, em or otherwise.

Do not calculate score.
Set score to 0.

Job Description:
${jobDescription}

Manager Resume Information:
${JSON.stringify(managerInfo)}

Developer Resume Information:
${JSON.stringify(developerInfo)}
`,
  );

  try {
    const parsed = result?.finalOutput ?? createAgentCompareJobToResumes();
    const score = calculateScore(parsed);
    console.log("Comparison Complete!\n");

    return {
      companySummary: parsed.companySummary,
      matches: parsed.matches,
      reasonRecommendedResume: parsed.reasonRecommendedResume,
      reasonWhyMe: parsed.reasonWhyMe,
      recommendedResume: parsed.recommendedResume,
      resumeData: parsed.resumeData,
      score,
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

    return createAgentCompareJobToResumes();
  }
}
