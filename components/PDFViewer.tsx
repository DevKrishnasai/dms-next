"use client";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
  return (
    <div className="w-full h-full">
      <iframe
        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title={fileName}
        className="w-full h-full border-none"
        style={{ minHeight: "calc(100vh - 120px)" }}
      />
    </div>
  );
}
