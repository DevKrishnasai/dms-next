"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ActionBarProps {
  fileName: string;
  canView?: boolean;
  canEdit?: boolean;
  canDownload?: boolean;
  currentMode?: "view" | "edit";
}

export default function ActionBar({
  fileName,
  canView = true,
  canEdit = true,
  canDownload = true,
  currentMode = "view"
}: ActionBarProps) {
  const router = useRouter();
  const encodedName = encodeURIComponent(fileName);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">
            {fileName}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-4">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-md transition-colors"
            title="Back to home"
          >
            ← Back
          </button>

          {/* View Button */}
          {canView && currentMode !== "view" && (
            <Link
              href={`/view/${encodedName}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              title="Switch to view mode"
            >
              👁 View
            </Link>
          )}

          {/* Edit Button */}
          {canEdit && currentMode !== "edit" && (
            <Link
              href={`/edit/${encodedName}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
              title="Switch to edit mode"
            >
              ✏️ Edit
            </Link>
          )}

          {/* Download Button */}
          {canDownload && (
            <a
              href={`/api/files/${encodedName}`}
              download
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-md transition-colors"
              title="Download document"
            >
              ⬇ Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
