"use client";

import { useEffect, useState } from "react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import ActionBar from "@/components/ActionBar";
import PDFViewer from "@/components/PDFViewer";
import ImageViewer from "@/components/ImageViewer";
import { getFileType, getOfficeType } from "@/lib/file-utils";
import { useParams, useRouter } from "next/navigation";

export default function ViewPage() {
  const params = useParams();
  const router = useRouter();
  const fileName = decodeURIComponent(params.name as string);

  const [cfg, setCfg] = useState(null);
  const [fileType, setFileType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = getFileType(fileName);
    setFileType(type);

    if (type === "office") {
      // Fetch ONLYOFFICE config for Office documents
      fetch(`/api/docs/${fileName}/view-config`)
        .then(r => {
          if (!r.ok) throw new Error("Failed to load document config");
          return r.json();
        })
        .then(({ config, token }) => {
          setCfg({ ...config, token });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading document:", err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fileName]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ActionBar fileName={fileName} canEdit={false} />
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-900 mb-2">Error Loading Document</h2>
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ActionBar
        fileName={fileName}
        canView={true}
        canEdit={getFileType(fileName) === "office"}
        canDownload={true}
        currentMode="view"
      />

      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-slate-600">Loading document...</p>
            </div>
          </div>
        ) : fileType === "office" && cfg ? (
          <div style={{ height: "calc(100vh - 80px)" }}>
            <DocumentEditor
              id="onlyoffice-editor-view"
              documentServerUrl={process.env.NEXT_PUBLIC_ONLYOFFICE_URL!}
              config={cfg}
            />
          </div>
        ) : fileType === "pdf" ? (
          <PDFViewer fileUrl={`/api/files/${encodeURIComponent(fileName)}`} fileName={fileName} />
        ) : fileType === "image" ? (
          <ImageViewer fileUrl={`/api/files/${encodeURIComponent(fileName)}`} fileName={fileName} />
        ) : (
          <div className="max-w-4xl mx-auto mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-bold text-yellow-900 mb-2">Preview Not Available</h2>
            <p className="text-yellow-800 mb-4">
              This file type cannot be previewed. Please download it to view.
            </p>
            <a
              href={`/api/files/${encodeURIComponent(fileName)}`}
              download
              className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
            >
              ⬇ Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
