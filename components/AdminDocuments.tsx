"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminDocument {
  id: number;
  name: string;
  fileType: string;
  category: string | null;
  sentiment: string | null;
  uploadedAt: string;

  user: {
    id: number;
    name: string | null;
    email: string;
  };

  folder: {
    id: number;
    name: string;
  } | null;
}

interface AdminDocumentsProps {
  documents: AdminDocument[];
}

export default function AdminDocuments({
  documents,
}: AdminDocumentsProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
const [deleting, setDeleting] = useState<number | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    const searchText = search.toLowerCase();

    return (
      doc.name.toLowerCase().includes(searchText) ||
      doc.user.email.toLowerCase().includes(searchText) ||
      (doc.user.name || "")
        .toLowerCase()
        .includes(searchText)
    );
  });
async function handleDelete(
  documentId: number,
  documentName: string
) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${documentName}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeleting(documentId);

    const response = await fetch(
      `/api/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete document"
      );
    }

    alert("Document deleted successfully!");

    router.refresh();
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete document"
    );
  } finally {
    setDeleting(null);
  }
}
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Document Management
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search documents or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-3 w-full"
        />
      </div>

      {filteredDocuments.length === 0 ? (
        <p className="text-gray-500">
          No documents found.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow p-6"
            >
              <h2 className="text-xl font-bold">
                {doc.name}
              </h2>

              <p className="text-gray-500 mt-1">
                {doc.fileType}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  {doc.category || "General"}
                </span>

                {doc.sentiment && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    {doc.sentiment}
                  </span>
                )}

                {doc.folder && (
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
                    📁 {doc.folder.name}
                  </span>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Owner:</strong>{" "}
                  {doc.user.name || "Unnamed User"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {doc.user.email}
                </p>

                <p>
                  <strong>Uploaded:</strong>{" "}
                  {new Date(doc.uploadedAt)
                    .toISOString()
                    .split("T")[0]}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-5">
  <a
    href={`/api/documents/${doc.id}/preview`}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
  >
    Preview
  </a>

  <a
    href={`/api/documents/${doc.id}/download`}
    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
  >
    Download
  </a>

 <button
  type="button"
  onClick={() =>
    handleDelete(doc.id, doc.name)
  }
  disabled={deleting === doc.id}
  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {deleting === doc.id
    ? "Deleting..."
    : "Delete"}
</button>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}