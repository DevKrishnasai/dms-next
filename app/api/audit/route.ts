import fs from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auditLogPath = process.env.AUDIT_LOG_PATH || "D:\\Projects\\dms-next\\dms\\audit.json";

    if (!fs.existsSync(auditLogPath)) {
      return NextResponse.json({ events: [] });
    }

    const content = fs.readFileSync(auditLogPath, "utf-8");
    const events = JSON.parse(content || "[]");

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error reading audit log:", error);
    return NextResponse.json(
      { error: "Failed to read audit log" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const auditLogPath = process.env.AUDIT_LOG_PATH || "D:\\Projects\\dms-next\\dms\\audit.json";
    let logs = [];

    if (fs.existsSync(auditLogPath)) {
      const content = fs.readFileSync(auditLogPath, "utf-8");
      logs = JSON.parse(content || "[]");
    }

    const entry = {
      ...body,
      timestamp: new Date().toISOString(),
      user: process.env.DEMO_USERNAME
    };

    logs.push(entry);

    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    fs.writeFileSync(auditLogPath, JSON.stringify(logs, null, 2));

    console.log(`[AUDIT] ${entry.event}: ${entry.fileName}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging audit event:", error);
    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }
}
