import fs from "fs";
import path from "path";

export async function GET() {
  const basePath = process.env.DMS_BASE_PATH!;

  // Define allowed file extensions for the demo
  const allowedExt = new Set([
    "doc", "docx",
    "xls", "xlsx",
    "ppt", "pptx",
    "pdf",
    "png", "jpg", "jpeg", "gif", "webp",
    "txt", "csv", "md"
  ]);

  // Read directory entries and filter to only files with allowed extensions
  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  const docs = entries
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    // Exclude audit log and hidden/system files
    .filter((name) => name.toLowerCase() !== "audit.json" && !name.startsWith("."))
    // Keep only allowed extensions
    .filter((name) => {
      const ext = name.split(".").pop()?.toLowerCase() || "";
      return allowedExt.has(ext);
    })
    .map((name) => {
      const full = path.join(basePath, name);
      const stat = fs.statSync(full);
      const ext = name.split(".").pop()?.toLowerCase();

      return {
        name,
        ext,
        size: stat.size,
        updatedAt: stat.mtime.toISOString()
      };
    });

  return Response.json(docs);
}
