import fs from "fs";

export async function logAuditEvent(entry: {
  event: string;
  fileName: string;
  user?: string;
  mode?: string;
}) {
  try {
    const auditLogPath = process.env.AUDIT_LOG_PATH || "D:\\Projects\\dms-next\\dms\\audit.json";
    let logs: any[] = [];

    if (fs.existsSync(auditLogPath)) {
      const content = fs.readFileSync(auditLogPath, "utf-8");
      logs = JSON.parse(content || "[]");
    }

    const newEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      user: entry.user || process.env.DEMO_USERNAME
    };

    logs.push(newEntry);

    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    fs.writeFileSync(auditLogPath, JSON.stringify(logs, null, 2));
    console.log(`[AUDIT] ${entry.event}: ${entry.fileName}`);

    return true;
  } catch (error) {
    console.error("Audit log error:", error);
    return false;
  }
}
