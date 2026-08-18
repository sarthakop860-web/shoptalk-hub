/**
 * Small helpers shared by the submission form and the submissions list.
 */

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

/** Allowed PowerPoint extensions. */
export function getExtension(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pptx")) return "pptx";
  if (lower.endsWith(".ppt")) return "ppt";
  return null;
}

/** Removes spaces / unsafe characters so the filename is always storage-safe. */
export function slugifyPart(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_") // anything unsafe becomes an underscore
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "unknown"
  );
}

/** Builds the final filename: ROLLNO_NAME.pptx */
export function buildFileName(rollNumber: string, studentName: string, ext: string): string {
  return `${slugifyPart(rollNumber).toUpperCase()}_${slugifyPart(studentName)}.${ext}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
