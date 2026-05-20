import z from "zod";
import { Match } from "./ai/agentExtractResume";
import { AgentExtractResumeSchema } from "./ai/agentExtractResume";

const OutputMarkdownSchema = z.object({
  companyName: z.string(),
  comparison: AgentExtractResumeSchema,
  coverLetter: z.string(),
  formattedDate: z.string(),
  jobTitle: z.string(),
  url: z.string(),
});

type OutputMarkdown = z.infer<typeof OutputMarkdownSchema>;

export function outputMarkdown({
  companyName,
  comparison,
  coverLetter,
  formattedDate,
  jobTitle,
  url,
}: OutputMarkdown) {
  return `
# ${jobTitle} | ${companyName}
**URL**: ${url}

**Date**: ${formattedDate}

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

---
## Cover Letter

\`\`\`text
  ${coverLetter}

  Sincerely,

  Steve Swanson
  (210) 262-2271
  steve.e.swanson@gmail.com
\`\`\`
  `;
}
