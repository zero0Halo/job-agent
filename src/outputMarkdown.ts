import { Match } from "./ai/agentExtractResume";

export function outputMarkdown({
  jobTitle,
  companyName,
  url,
  comparison,
}: {
  jobTitle?: string;
  companyName?: string;
  url: string;
  comparison: any;
}) {
  return `
# ${jobTitle} | ${companyName}
URL: ${url}

## Recommended: ${comparison.recommendedResume} (score: ${comparison.score})

${comparison.summary}

---

### Strong Matches
${comparison.strongMatches.map(
  (match: Match) => `* **${match.jobRequirement}**: ${match.candidateEvidence}`,
)}



### Weak Matches
${comparison.weakMatches.map(
  (match: Match) => `* **${match.jobRequirement}**: ${match.candidateEvidence}`,
)}

### Missing Requirements
${comparison.missingRequirement.map(
  (match: Match) => `* **${match.jobRequirement}**: ${match.candidateEvidence}`,
)}
  `;
}
