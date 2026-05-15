import z from "zod";
import { Match } from "./ai/agentExtractResume";
import { AgentExtractResumeSchema } from "./ai/agentExtractResume";

const OutputMarkdownSchema = z.object({
  jobTitle: z.string(),
  companyName: z.string(),
  url: z.string(),
  comparison: AgentExtractResumeSchema,
});

type OutputMarkdown = z.infer<typeof OutputMarkdownSchema>;

export function outputMarkdown({
  jobTitle,
  companyName,
  url,
  comparison,
}: OutputMarkdown) {
  return `
# ${jobTitle} | ${companyName}
**URL**: ${url}

## Recommended: ${comparison.recommendedResume} (score: ${comparison.score})

${comparison.summary}

---

### Strong Matches
${comparison.strongMatches
  .map(
    (match: Match) =>
      `* **${match.jobRequirement}**: ${match.candidateEvidence}`,
  )
  .join("\n")}

### Weak Matches
${comparison.weakMatches
  .map(
    (match: Match) =>
      `* **${match.jobRequirement}**: ${match.candidateEvidence}`,
  )
  .join("\n")}

### Missing Requirements
${comparison.missingRequirements
  .map(
    (match: Match) =>
      `* **${match.jobRequirement}**: ${match.candidateEvidence}`,
  )
  .join("\n")}
  `;
}
