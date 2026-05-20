import { AgentExtractResume } from "./ai/agentExtractResume";

export function calculateScore(comparison: AgentExtractResume): number {
  const total =
    comparison.strongMatches.length +
    comparison.weakMatches.length +
    comparison.missingRequirements.length;

  if (total === 0) return 0;

  return Math.round(
    ((comparison.strongMatches.length + comparison.weakMatches.length * 0.5) /
      total) *
      100,
  );
}
