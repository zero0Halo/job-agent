import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "fs";
import { agentExtractJob } from "./ai/agentExtractJob";
import { loadPdf } from "./loadPdf";
import { agentExtractResume } from "./ai/agentExtractResume";

dotenv.config();

const rl = readline.createInterface({ input, output });
const regexTitle = /<title>(.*?)<\/title>/i;

async function main() {
  const linkedinUrl = await rl.question("Paste the LinkedIn job URL: ");
  const [trimmedUrl] = linkedinUrl.trim().split("?");
  const isLinkedIn = trimmedUrl.includes("linkedin.com");

  if (!trimmedUrl) {
    console.error("No URL provided.");
    process.exitCode = 1;
    return;
  }

  if (!isLinkedIn) {
    console.error("The URL provided is not from a LinkedIn job listing.\n");
    process.exitCode = 1;
    return;
  }

  console.log(`\nLinkedIn URL received: ${trimmedUrl}\n`);

  const response = await fetch(trimmedUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const text = await response.text();
  const titleTagText = text?.match(regexTitle)?.at(1);

  // Hardcoding for development
  // const jobDescription = await rl.question("Paste the job description:");
  const jobDescription = `Ironclad is the leading AI contracting platform that transforms agreements into assets. Contracts move faster, insights surface instantly, and agents push work forward, all with you in control. Whether you’re buying or selling, Ironclad unifies the entire process on one intelligent platform, providing leaders with the visibility they need to stay one step ahead. That’s why the world’s most transformative organizations, from Rivian to the World Health Organization and the Associated Press, trust Ironclad to accelerate their business.

We’re consistently recognized as a leader in the industry: a Leader in the Forrester Wave and Gartner Magic Quadrant for Contract Lifecycle Management, a Fortune Great Place to Work, and one of Fast Company’s Most Innovative Workplaces. Ironclad has also been named to Forbes’ AI 50 and Business Insider’s list of Companies to Bet Your Career On. We’re backed by leading investors including Accel, Y Combinator, Sequoia, BOND, and Franklin Templeton. For more information, visit www.ironcladapp.com or follow us on LinkedIn.

This is a hybrid role. Office attendance is required at least twice a week on Tuesdays and Thursdays for collaboration and connection. There may be additional in-office days for team or company events.

Responsibilities:

Team Leadership: Manage and grow a high-performing team of engineers. Foster a culture of technical excellence, high agency, and pragmatic delivery. Challenge the status quo when there are opportunities to elevate Ironclad’s product and culture.
Product Delivery: Lead the execution of agentic solutions to major contracting challenges faced by our customers’ procurement teams, spearhead scalability improvements to meet increasing demands of enterprise-scale performance, and more.
Strategic Roadmap: Partner with Product and Design to ensure that proposed solutions fully satisfy our customers’ needs and align to Ironclad’s high-level strategic objectives.
Technical Contribution: Actively participate in the codebase, and use sound technical judgment and collaborative critique to refine specs and designs.
System Ownership: Own and improve the existing core systems that power your team’s product surfaces, ensuring they are scalable, reliable, and maintainable.
AI-Forward Operations: Lead by example in adopting AI tooling (such as Cursor or Claude Code) to improve engineering velocity and code quality.
Operational Excellence: Work with Quality Engineers, Security Engineers, and SREs to define testing strategies for non-deterministic AI outputs, validate end-to-end experiences, guard against vulnerabilities and unsafe coding practices, and ensure adequate performance at high scale.
Team Representation: Manage cross-team dependencies to mitigate delivery delays. Build awareness of your team’s work for other teams and departments.
Hiring and Performance: Interview and recruit more talented engineers to join Ironclad. Provide 1:1 support for your team’s engineers and formal feedback for talent management when needed.

What We’re Looking For:

Experience: 5+ years of software engineering experience with a track record of shipping production-grade web applications.
Leadership: 2+ years of experience in engineering management or technical leadership, with a proven ability to grow engineers.
Technical Stack: Proficiency in TypeScript, React, and Node.js. Experience with Docker, Kubernetes, PostgreSQL, and Google Cloud Platform is a plus.
Passion: Desire to build and ship great product, keeping customer value in mind. A high bar for quality, upheld personally and with other engineers.
AI Fluency: Familiarity with modern AI tools for code development (such as Claude Code) and experience incorporating AI into a customer-facing product experience.
Soft Skills: Excellent cross-team communication and collaboration skills, both spoken and written.
Ironclad Culture: Alignment with Ironclad’s values: Drive, Intent, Integrity, and Empathy.

Base Salary Range: $245,000 - $270,000

The base salary range represents the minimum and maximum of the salary range for this position based at our San Francisco headquarters. The actual base salary offered for this position will depend on numerous factors, including individual proficiency, anticipated performance, and the location of the selected candidate. Our base salary is just one component of Ironclad’s competitive total rewards package, which also includes equity awards (a new hire grant, along with opportunities for additional awards throughout your tenure), competitive health and wellness benefits, and a commitment to career growth and development.

US Full-Time Employee Benefits at Ironclad:

100% health coverage for employees (medical, dental, and vision), and 75% coverage for dependents with buy-up plan options available
Market-leading leave policies, including gender-neutral parental leave and compassionate leave
Family forming support through Maven for you and your partner
Paid time off - take the time you need, when you need it
Monthly stipends for wellbeing, hybrid work, and (if applicable) cell phone use
Mental health support through Modern Health, including therapy, coaching, and digital tools
Pre-tax commuter benefits (US Employees)
401(k) plan with Fidelity with employer match (US Employees)
Regular team events to connect, recharge, and have fun
And most importantly: the opportunity to help build the company you want to work at
UK Employee-specific benefits are included on our UK job postings

Pursuant to the San Francisco Fair Chance Ordinance, we will consider for employment qualified applicants with arrest and conviction records.

Compensation Range: $245K - $270K`;

  if (!jobDescription) {
    console.error("No job description provided.");
    process.exitCode = 1;
    return;
  }

  console.log("Job description received!\n");

  const { companyName, jobTitle } = await agentExtractJob(
    jobDescription,
    titleTagText,
  );

  const developerResume = await loadPdf("developer.pdf");
  const managerResume = await loadPdf("manager.pdf");
  const developerInfo = await agentExtractResume(developerResume);
  const managerInfo = await agentExtractResume(managerResume);

  console.log("Extracted Job Information:");
  console.log(developerInfo);
  console.log(managerInfo);
}

main()
  .catch((error) => {
    console.error("Something went wrong:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
