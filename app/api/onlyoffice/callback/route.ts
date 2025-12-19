import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface CallbackData {
  status: number;
  key?: string;
  token?: string;
  url?: string;
  users?: string[];
  changesurl?: string;
  commandData?: string;
  error?: string;
  actions?: Array<{ type: string; userid: string }>;
}

export async function POST(req: Request) {
  try {
    const body: CallbackData = await req.json();

    // Verify JWT token if present
    if (body.token) {
      try {
        jwt.verify(
          body.token,
          process.env.ONLYOFFICE_JWT_SECRET || "secret",
          { algorithms: ["HS256"] }
        );
      } catch (err) {
        console.error("JWT verification failed:", err);
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 403 }
        );
      }
    }

    console.log("[ONLYOFFICE Callback]", JSON.stringify(body, null, 2));

    // Status codes:
    // 0 = No changes
    // 1 = Saved (document has been changed)
    // 2 = Save Error
    // 3 = Closed by user
    // 4 = Closed and forced saved
    // 6 = Being edited
    // 7 = Error in open
    // 8 = User disconnected

    if (body.status === 1 || body.status === 4) {
      // Document saved - download from ONLYOFFICE and update DMS
      if (body.url) {
        try {
          const fileBuffer = await fetch(body.url).then(r => r.arrayBuffer());
          const dmsBasePath = process.env.DMS_BASE_PATH;

          if (!dmsBasePath) {
            throw new Error("DMS_BASE_PATH not configured");
          }

          // Extract filename from the document key
          const key = body.key || "unknown";
          const fileName = key.split("_")[0]; // Remove timestamp suffix

          const filePath = path.join(dmsBasePath, fileName);

          // Save file to DMS
          fs.writeFileSync(filePath, Buffer.from(fileBuffer));

          console.log(`✓ Document saved: ${fileName}`);

          // Log audit
          logAudit({
            event: "document_saved",
            fileName,
            user: process.env.DEMO_USERNAME,
            timestamp: new Date().toISOString()
          });

          return NextResponse.json({ error: 0 });
        } catch (error) {
          console.error("Error saving document:", error);
          return NextResponse.json(
            { error: "Failed to save document" },
            { status: 500 }
          );
        }
      }
    } else if (body.status === 2) {
      console.error("ONLYOFFICE Save Error:", body.error);
      return NextResponse.json(
        { error: "Save error in ONLYOFFICE" },
        { status: 400 }
      );
    } else if (body.status === 3 || body.status === 8) {
      // Document closed
      console.log("Document closed or user disconnected");
    }

    return NextResponse.json({ error: 0 });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

function logAudit(entry: { event: string; fileName: string; user?: string; timestamp?: string }) {
  try {
    const auditLogPath = process.env.AUDIT_LOG_PATH || "D:\\Projects\\dms-next\\dms\\audit.json";
    let logs = [];

    if (fs.existsSync(auditLogPath)) {
      const content = fs.readFileSync(auditLogPath, "utf-8");
      logs = JSON.parse(content || "[]");
    }

    logs.push(entry);

    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    fs.writeFileSync(auditLogPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
