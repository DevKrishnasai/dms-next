"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  name: string;
  ext: string;
  size: number;
  updatedAt: string;
};

function getFileIcon(ext: string): string {
  const icons: { [key: string]: string } = {
    docx: "📄",
    doc: "📄",
    xlsx: "📊",
    xls: "📊",
    pptx: "🎯",
    ppt: "🎯",
    pdf: "📕",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    gif: "🖼️",
    txt: "📝",
    csv: "📋"
  };
  return icons[ext.toLowerCase()] || "📄";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function Home() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then(r => r.json())
      .then((docs: Doc[]) => {
        setDocs(docs.sort((a: Doc, b: Doc) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load documents:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            📁 Document Management System
          </h1>
          <p className="text-lg text-slate-600">
            Enterprise-grade document management with ONLYOFFICE integration
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin">⏳</div>
              <p className="text-slate-600 mt-4">Loading documents...</p>
            </div>
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">No documents available</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">{docs.length}</div>
                <div className="text-sm text-slate-600">Documents</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">
                  {formatSize(docs.reduce((sum, d) => sum + d.size, 0))}
                </div>
                <div className="text-sm text-slate-600">Total Size</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">✓</div>
                <div className="text-sm text-slate-600">Ready to View/Edit</div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map(doc => (
                <div
                  key={doc.name}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{getFileIcon(doc.ext)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {doc.ext.toUpperCase()} • {formatSize(doc.size)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-3 border-b border-slate-100">
                    <p className="text-sm text-slate-600">
                      <span className="text-slate-400">Modified:</span>{" "}
                      {formatDate(doc.updatedAt)}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 py-4 flex gap-2">
                    <Link
                      href={`/view/${encodeURIComponent(doc.name)}`}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors text-center"
                    >
                      👁 View
                    </Link>
                    <Link
                      href={`/edit/${encodeURIComponent(doc.name)}`}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors text-center"
                    >
                      ✏️ Edit
                    </Link>
                    <a
                      href={`/api/files/${encodeURIComponent(doc.name)}`}
                      download
                      className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 text-sm font-medium rounded-md transition-colors text-center"
                    >
                      ⬇ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
