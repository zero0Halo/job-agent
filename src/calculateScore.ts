import { AgentCompareJobToResumes } from "./ai/agentCompareJobToResumes";

const SCORING = {
  critical: {
    strong: 1,
    weak: 0.25,
    missing: -1,
  },
  important: {
    strong: 1,
    weak: 0.5,
    missing: 0,
  },
  neutral: {
    strong: 0.5,
    weak: 0.25,
    missing: 0,
  },
};

export function calculateScore(comparison: AgentCompareJobToResumes): number {
  const score = comparison.matches.reduce((total, match) => {
    const confidenceScore = SCORING[match.importance][match.confidence];
    return total + confidenceScore;
  }, 0);

  const total = comparison.matches.length;
  const strongMatches = comparison.matches.filter(
    (match) => match.confidence === "strong",
  ).length;
  const weakMatches = comparison.matches.filter(
    (match) => match.confidence === "weak",
  ).length;

  if (total === 0) return 0;
  // 7 + 1 / 9
  return Math.round((score / total) * 100);
}
