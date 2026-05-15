import { Agent, run } from "@openai/agents";
import { z } from "zod";

export const MatchSchema = z.object({
  jobRequirement: z.string(),
  candidateEvidence: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const AgentExtractResumeSchema = z.object({
  recommendedResume: z.string(),
  score: z.number(),
  missingRequirements: z.array(MatchSchema),
  strongMatches: z.array(MatchSchema),
  weakMatches: z.array(MatchSchema),
  summary: z.string(),
});

export type Match = z.infer<typeof MatchSchema>;
export type AgentExtractResume = z.infer<typeof AgentExtractResumeSchema>;

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
    const parsed = result?.finalOutput ?? {
      recommendedResume: "",
      score: 0,
      missingRequirements: [],
      strongMatches: [],
      weakMatches: [],
      summary: "",
    };

    console.log("Resume information extracted!");

    return {
      recommendedResume: parsed.recommendedResume,
      score: parsed.score,
      missingRequirements: parsed.missingRequirements,
      strongMatches: parsed.strongMatches,
      weakMatches: parsed.weakMatches,
      summary: parsed.summary,
    };
  } catch (error) {
    console.error("Error parsing resume information:", error);

    return {
      recommendedResume: "",
      score: 0,
      missingRequirements: [],
      strongMatches: [],
      weakMatches: [],
      summary: "",
    };
  }
}
