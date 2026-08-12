"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);

  async function searchDocuments() {
    const response = await fetch(
      `/api/search?query=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    setDocuments(data);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Documents
      </h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter keyword..."
          className="border p-3 rounded w-96"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={searchDocuments}
          className="bg-blue-600 text-white px-5 rounded"
        >
          Search
        </button>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 shadow"
          >
            <h2 className="font-bold">
              {doc.name}
            </h2>

            <p className="text-gray-600">
              {doc.fileType}
            </p>

            <p className="mt-2">
              {doc.extractedText?.substring(0, 250)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}