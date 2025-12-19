export type FileType = "office" | "pdf" | "image" | "text" | "unknown";

export function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
    return "office";
  }
  if (ext === "pdf") {
    return "pdf";
  }
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    return "image";
  }
  if (["txt", "csv", "json", "md"].includes(ext)) {
    return "text";
  }

  return "unknown";
}

export function getOfficeType(filename: string): "word" | "cell" | "slide" | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const typeMap: { [key: string]: "word" | "cell" | "slide" } = {
    docx: "word",
    doc: "word",
    xlsx: "cell",
    xls: "cell",
    pptx: "slide",
    ppt: "slide"
  };

  return typeMap[ext] || null;
}

export function isEditableOffice(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ["docx", "xlsx", "pptx"].includes(ext);
}
