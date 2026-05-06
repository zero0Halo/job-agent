import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

async function main() {
  const linkedinUrl = await rl.question("Paste the LinkedIn job URL: ");

  const trimmedUrl = linkedinUrl.trim();

  if (!trimmedUrl) {
    console.error("No URL provided.");
    process.exitCode = 1;
    return;
  }

  console.log("\nLinkedIn URL received:");
  console.log(trimmedUrl);
}

main()
  .catch((error) => {
    console.error("Something went wrong:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
