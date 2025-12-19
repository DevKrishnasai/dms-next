import jwt from "jsonwebtoken";

export async function GET(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name: fileName } = await context.params;

  const ext = fileName.split(".").pop()!.toLowerCase();

  const typeMap: { [key: string]: "word" | "cell" | "slide" } = {
    docx: "word",
    doc: "word",
    xlsx: "cell",
    xls: "cell",
    pptx: "slide",
    ppt: "slide"
  };

  const documentType = typeMap[ext];

  // Check if user has edit permission (demo: hardcoded)
  if (process.env.DEMO_CAN_EDIT !== "true") {
    return Response.json(
      { error: "You do not have permission to edit this document" },
      { status: 403 }
    );
  }

  // Generate watermark
  const timestamp = new Date().toLocaleString("en-US");
  const watermarkText = `${process.env.DEMO_USERNAME} | ${process.env.DEMO_WATERMARK_TEXT} | ${timestamp}`;

  const config = {
    document: {
      fileType: ext,
      key: `${fileName}_${Date.now()}`,
      title: fileName,
      url: `http://host.docker.internal:3000/api/files/${fileName}`,
      permissions: {
        edit: true,
        download: process.env.DEMO_CAN_DOWNLOAD === "true",
        print: false,
        copy: false
      }
    },
    documentType,
    editorConfig: {
      mode: "edit",
      callbackUrl: `http://host.docker.internal:3000/api/onlyoffice/callback`,
      user: {
        id: "demo-user",
        name: process.env.DEMO_USERNAME || "User"
      },
      customization: {
        // Hide ONLYOFFICE UI/branding
        hideRightMenu: true,
        hideToolBar: false, // Keep toolbar for editing
        hideStatusBar: false,
        statusBar: true,
        logo: false,
        about: false,
        feedback: false,
        goback: false,
        chat: false,
        help: false,
        comments: false,
        autosave: true,
        forcesave: false,
        trackChanges: false,
        compactHeader: false,
        displayMode: "default",
        // Watermark styling
        watermark: {
          type: "text",
          text: watermarkText,
          opacity: 0.15,
          angle: 45,
          height: 100,
          width: 300
        }
      }
    }
  };

  const token = jwt.sign(
    config,
    process.env.ONLYOFFICE_JWT_SECRET!,
    { expiresIn: "30m" }
  );

  return Response.json({ config, token });
}
