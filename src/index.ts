import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

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

  const jobDescription = await rl.question("Paste the job description:");

  if (!jobDescription) {
    console.error("No job description provided.");
    process.exitCode = 1;
    return;
  }

  console.log("Job description received!\n");
}

main()
  .catch((error) => {
    console.error("Something went wrong:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
