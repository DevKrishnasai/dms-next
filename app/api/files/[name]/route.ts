import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;

  const filePath = path.join(
    process.env.DMS_BASE_PATH!,
    name
  );

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stream = fs.createReadStream(filePath);

  // Log download event
  logAudit({
    event: "document_downloaded",
    fileName: name,
    user: process.env.DEMO_USERNAME,
    timestamp: new Date().toISOString()
  }).catch(err => console.error("Audit log failed:", err));

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`
    }
  });
}

async function logAudit(entry: any) {
  try {
    const response = await fetch("http://localhost:3000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to log audit:", error);
    return false;
  }
}
