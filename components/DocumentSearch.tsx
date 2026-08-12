"use client";

import { useState } from "react";
import Link from "next/link";
import CategoryFilter from "./CategoryFilter";
import PreviewButton from "./PreviewButton";
import DownloadButton from "./DownloadButton";
import DeleteButton from "./DeleteButton";

interface Tag {
  id: number;
  name: string;
}

interface DocumentItem {
  id: number;
  name: string;
  fileType: string;
  filePath: string;
  fileSize: number | null;
  extractedText: string | null;
  summary: string | null;
  sentiment: string | null;
  category: string | null;
  favorite: boolean;
  uploadedAt: string | Date;
  folderId: number | null;
  tags: Tag[];
}

export default function DocumentSearch({
  documents,
}: {
  documents: DocumentItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedTag, setSelectedTag] = useState("All");
  const [favoriteFilter, setFavoriteFilter] = useState("All");
  /*
   * Get all unique tags from all documents
   */
  const allTags = Array.from(
    new Map(
      documents
        .flatMap((doc) => doc.tags || [])
        .map((tag) => [tag.id, tag])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  /*
   * Filter documents
   */
  const filteredDocuments = documents
    .filter((doc) => {
      const searchText = search.toLowerCase().trim();

      /*
       * Search document name
       */
      const matchesName = doc.name
        .toLowerCase()
        .includes(searchText);

      /*
       * Search extracted text
       */
      const matchesText = (doc.extractedText || "")
        .toLowerCase()
        .includes(searchText);

      /*
       * Search tags
       */
      const matchesTagSearch = (doc.tags || []).some((tag) =>
        tag.name.toLowerCase().includes(searchText)
      );

      const matchesSearch =
        searchText === "" ||
        matchesName ||
        matchesText ||
        matchesTagSearch;

      /*
       * Category filter
       */
      const matchesCategory =
        selectedCategory === "All" ||
        doc.category === selectedCategory;

      /*
       * Selected tag filter
       */
      const matchesSelectedTag =
        selectedTag === "All" ||
        (doc.tags || []).some(
          (tag) => tag.name === selectedTag
        );

        const matchesFavorite =
  favoriteFilter === "All" ||
  (favoriteFilter === "Favorites" && doc.favorite === true);

     return (
  matchesSearch &&
  matchesCategory &&
  matchesSelectedTag &&
  matchesFavorite
);
    })
    .sort((a, b) => {
      /*
       * Newest
       */
      if (sortBy === "Newest") {
        return (
          new Date(b.uploadedAt).getTime() -
          new Date(a.uploadedAt).getTime()
        );
      }

      /*
       * Oldest
       */
      if (sortBy === "Oldest") {
        return (
          new Date(a.uploadedAt).getTime() -
          new Date(b.uploadedAt).getTime()
        );
      }

      /*
       * A-Z
       */
      if (sortBy === "A-Z") {
        return a.name.localeCompare(b.name);
      }

      /*
       * Z-A
       */
      if (sortBy === "Z-A") {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });

  return (
    <>
      {/* Search */}
      <input
        className="border p-3 rounded-lg w-full mb-6"
        placeholder="Search documents, text, or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option>Newest</option>
          <option>Oldest</option>
          <option>A-Z</option>
          <option>Z-A</option>
        </select>

        {/* Category */}
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />

        {/* Tag */}
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="All">
            All Tags
          </option>

          {allTags.map((tag) => (
            <option
              key={tag.id}
              value={tag.name}
            >
              {tag.name}
            </option>
          ))}
          
        </select>
      </div>

      {/* Active tag filter */}
      {selectedTag !== "All" && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-gray-600">
            Filtered by:
          </span>

          <button
            type="button"
            onClick={() => setSelectedTag("All")}
            className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
          >
            🏷 {selectedTag} ×
          </button>
        </div>
      )}
      {/* Favorites */}
<select
  value={favoriteFilter}
  onChange={(e) => setFavoriteFilter(e.target.value)}
  className="border rounded-lg p-2"
>
  <option value="All">
    All Documents
  </option>

  <option value="Favorites">
    ⭐ Favorites Only
  </option>
</select>

      {/* Results */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <p className="text-gray-500">
            No matching documents found.
          </p>
        ) : (
          filteredDocuments.map((doc) => {
            const size =
              doc.fileSize &&
              doc.fileSize >= 1024 * 1024
                ? `${(
                    doc.fileSize /
                    (1024 * 1024)
                  ).toFixed(2)} MB`
                : doc.fileSize
                ? `${(
                    doc.fileSize / 1024
                  ).toFixed(2)} KB`
                : "Unknown";

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow p-6"
              >
                <Link
                  href={`/documents/${doc.id}`}
                  className="block hover:opacity-90"
                >
                  {/* Document name */}
         <div className="flex items-center justify-between">
  <h2 className="text-xl font-bold">
    {doc.name}
  </h2>

  {doc.favorite && (
    <span className="text-yellow-500 text-xl" title="Favorite">
      ⭐
    </span>
  )}
</div>
                  {/* File type and size */}
                  <div className="flex justify-between items-center text-gray-500 mt-2">
                    <span>
                      {doc.fileType}
                    </span>

                    <span>
                      {size}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                      {doc.category || "General"}
                    </span>
                  </div>

                  {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {doc.tags.map((tag) => (
      <button
        key={tag.id}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedTag(tag.name);
        }}
        className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition"
      >
        🏷 {tag.name}
      </button>
    ))}
  </div>
)}
                  {/* Uploaded date */}
                  <p className="mt-3 text-sm text-gray-600">
                    Uploaded:{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Kolkata",
                    }).format(
                      new Date(doc.uploadedAt)
                    )}
                  </p>

                  {/* Sentiment */}
                  <div className="mt-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white ${
                        doc.sentiment === "Positive"
                          ? "bg-green-500"
                          : doc.sentiment === "Negative"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {doc.sentiment || "Unknown"}
                    </span>
                  </div>

                  {/* Extracted text preview */}
                  <p className="mt-4 line-clamp-3 text-gray-700">
                    {doc.extractedText ||
                      "No extracted text available."}
                  </p>
                </Link>

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <PreviewButton id={doc.id} />

                  <DownloadButton id={doc.id} />

                  <DeleteButton id={doc.id} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}