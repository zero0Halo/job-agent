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
  const recommendedResume =
    comparison.recommendedResume.charAt(0).toUpperCase() +
    comparison.recommendedResume.slice(1);

  return `
# ${jobTitle} | ${companyName}
**URL**: [${url}](${url})

**Date**: ${formattedDate}

## Recommended: ${recommendedResume} (score: ${comparison.score})

${comparison.summary}

---

## Strong Matches
${comparison.matches
  .filter((match: Match) => match.confidence === "strong")
  .map(
    (match: Match) =>
      `* **${match.jobRequirement}**: ${match.candidateEvidence}\n\n`,
  )
  .join("\n\n")}

---

## Weak Matches
${comparison.matches
  .filter((match: Match) => match.confidence === "weak")
  .map(
    (match: Match) =>
      `* **${match.jobRequirement}**: ${match.candidateEvidence}\n\n`,
  )
  .join("\n\n")}

---

## Missing Requirements
${comparison.matches
  .filter((match: Match) => match.confidence === "missing")
  .map(
    (match: Match) =>
      `* **${match.jobRequirement}**: ${match.candidateEvidence}\n\n`,
  )
  .join("\n\n")}

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
