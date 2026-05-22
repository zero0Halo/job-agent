import { z } from "zod";

const NameToFilenameSchema = z.object({
  companyName: z.string(),
  extension: z.string().default("md"),
  formattedDate: z.string(),
  jobTitle: z.string(),
  parentDirectory: z.string().optional(),
});
type NameToFilename = z.infer<typeof NameToFilenameSchema>;

function stringCleanup(string: string): string {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nameToFilename({
  parentDirectory,
  formattedDate,
  companyName,
  jobTitle,
  extension,
}: NameToFilename): string {
  const filename = `${formattedDate}--${stringCleanup(companyName)}--${stringCleanup(jobTitle)}.${extension}`;
  return parentDirectory ? `${parentDirectory}/${filename}` : filename;
}
