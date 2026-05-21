import { AgentExtractResume } from "./ai/agentExtractResume";

export function calculateScore(comparison: AgentExtractResume): number {
  const total = comparison.matches.length;
  const strongMatches = comparison.matches.filter(
    (match) => match.confidence === "strong",
  ).length;
  const weakMatches = comparison.matches.filter(
    (match) => match.confidence === "weak",
  ).length;

  if (total === 0) return 0;
  // 7 + 1 / 9
  return Math.round(((strongMatches + weakMatches * 0.5) / total) * 100);
}
