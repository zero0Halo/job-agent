function outputMarkdown(text: string) {
  return `
# jobTitle | companyName
[*date*] *url*

## Recommended: recommendedResume (score)

summary

---

### Strong Matches
* **jobRequirement**: candidateEvidence

### Weak Matches
* **jobRequirement**: candidateEvidence

### Missing Requirements
* **jobRequirement**: candidateEvidence
  `;
}
