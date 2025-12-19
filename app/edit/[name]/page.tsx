"use client";

import { useEffect, useState } from "react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import ActionBar from "@/components/ActionBar";
import { getFileType } from "@/lib/file-utils";
import { useParams, useRouter } from "next/navigation";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const fileName = decodeURIComponent(params.name as string);

  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fileType = getFileType(fileName);

    // Only Office documents are editable
    if (fileType !== "office") {
      setError("This file type cannot be edited");
      setLoading(false);
      return;
    }

    // Fetch ONLYOFFICE edit config - async wrapper
    (async () => {
      try {
        const response = await fetch(`/api/docs/${fileName}/edit-config`);
        if (!response.ok) throw new Error("Failed to load edit config");
        const data = await response.json();
        setCfg({ ...data.config, token: data.token });
      } catch (err) {
        console.error("Error loading document:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [fileName]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ActionBar fileName={fileName} canView={true} canEdit={false} />
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-900 mb-2">Cannot Edit Document</h2>
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
        canEdit={false}
        canDownload={true}
        currentMode="edit"
      />

      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-slate-600">Loading document in edit mode...</p>
            </div>
          </div>
        ) : cfg ? (
          <div style={{ height: "calc(100vh - 80px)" }}>
            <DocumentEditor
              id="onlyoffice-editor-edit"
              documentServerUrl={process.env.NEXT_PUBLIC_ONLYOFFICE_URL!}
              config={cfg}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
