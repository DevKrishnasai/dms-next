"use client";

import Image from "next/image";

interface ImageViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function ImageViewer({ fileUrl, fileName }: ImageViewerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 py-8">
      <div className="relative w-full h-auto flex items-center justify-center" style={{ minHeight: "calc(100vh - 120px)" }}>
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-4xl max-h-[80vh] object-contain shadow-lg rounded-lg"
        />
      </div>
    </div>
  );
}
