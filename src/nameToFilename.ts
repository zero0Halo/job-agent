export function nameToFilename(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
