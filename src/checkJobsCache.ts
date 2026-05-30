import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function checkJobsCache(url: string) {
  // Get this file's path and directory in ordder to correctly target the cache file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const cachePath = path.join(__dirname, `../.cache/jobs.json`);
  try {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));
    const entry = cached[url];

    return entry ? true : false;
  } catch {
    return null;
  }
}
