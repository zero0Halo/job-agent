import { Agent, run } from "@openai/agents";
import { z } from "zod";

export const MatchSchema = z.object({
  jobRequirement: z.string(),
  candidateEvidence: z.string(),
  confidence: z.enum(["strong", "weak", "missing"]),
});

export const AgentExtractResumeSchema = z.object({
  recommendedResume: z.enum(["developer", "manager", "unknown"]),
  resumeData: z.string().nullable(),
  score: z.number(),
  matches: z.array(MatchSchema),
  summary: z.string(),
});

export type AgentExtractResume = z.infer<typeof AgentExtractResumeSchema>;

export function createAgentExtractResumeSchema(): AgentExtractResume {
  return {
    recommendedResume: "unknown",
    resumeData: null,
    score: 0,
    matches: [],
    summary: "",
  };
}

const agent = new Agent({
  name: "Resume extraction agent",
  outputType: AgentExtractResumeSchema,
  instructions: `
You extract structured candidate information from the passed resume.

Do not invent details or fields.
`,
});

export async function agentExtractResume(
  resume?: string,
): Promise<AgentExtractResume> {
  const result = await run(
    agent,
    `
Extract the following information from this resume: ${resume}

Do not wrap the results in markdown.
`,
  );

  try {
    const parsed = result?.finalOutput ?? createAgentExtractResumeSchema();

    console.log("Resume information extracted!\n");

    return {
      matches: parsed.matches,
      recommendedResume: parsed.recommendedResume as
        | "developer"
        | "manager"
        | "unknown",
      resumeData: parsed.resumeData,
      score: parsed.score,
      summary: parsed.summary,
    };
  } catch (error) {
    console.error("Error parsing resume information:", error);

    return createAgentExtractResumeSchema();
  }
}
