"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

interface DocumentVersion {
  id: number;
  documentId: number;
  name: string;
  fileType: string;
  filePath: string;
  fileSize: number | null;
  extractedText: string;
  summary: string | null;
  sentiment: string | null;
  category: string | null;
  createdAt: string;
}

interface VersionHistoryProps {
  documentId: number;
}

export default function VersionHistory({
  documentId,
}: VersionHistoryProps) {
  const router = useRouter();

  const [versions, setVersions] =
    useState<DocumentVersion[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [restoring, setRestoring] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadVersions() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/documents/${documentId}/versions`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load version history."
          );
        }

        const data =
          await response.json();

        setVersions(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load version history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVersions();
  }, [documentId]);

  async function restoreVersion(
    versionId: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to restore this version? The current document will be saved as a new version."
      );

    if (!confirmed) {
      return;
    }

    try {
      setRestoring(versionId);
      setError("");

      const response = await fetch(
        `/api/documents/${documentId}/restore/${versionId}`,
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to restore version."
        );
      }

      alert(
        "Version restored successfully!"
      );

      router.refresh();

      // Reload version history
      const versionsResponse =
        await fetch(
          `/api/documents/${documentId}/versions`,
          {
            cache: "no-store",
          }
        );

      if (versionsResponse.ok) {
        const updatedVersions =
          await versionsResponse.json();

        setVersions(
          Array.isArray(updatedVersions)
            ? updatedVersions
            : []
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to restore version."
      );
    } finally {
      setRestoring(null);
    }
  }

  function formatDate(
    date: string
  ) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }
    ).format(new Date(date));
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-3">
          Version History
        </h2>

        <p className="text-gray-500">
          Loading versions...
        </p>
      </div>
    );
  }

  if (error && versions.length === 0) {
    return (
      <div className="border rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-3">
          Version History
        </h2>

        <p className="text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}

      {versions.length === 0 ? (
        <p className="text-gray-500">
          No previous versions available.
        </p>
      ) : (
        <div className="space-y-5">
          {versions.map(
            (version, index) => (
              <div
                key={version.id}
                className="border rounded-xl p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Version{" "}
                      {versions.length -
                        index}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(
                        version.createdAt
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {version.sentiment && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          version.sentiment ===
                          "Positive"
                            ? "bg-green-100 text-green-700"
                            : version.sentiment ===
                              "Negative"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {
                          version.sentiment
                        }
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        restoreVersion(
                          version.id
                        )
                      }
                      disabled={
                        restoring ===
                        version.id
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {restoring ===
                      version.id
                        ? "Restoring..."
                        : "Restore"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Category
                    </p>

                    <p className="font-medium">
                      {version.category ||
                        "General"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Sentiment
                    </p>

                    <p className="font-medium">
                      {version.sentiment ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                {version.summary && (
                  <div className="mt-5">
                    <p className="text-sm text-gray-500 mb-1">
                      Summary
                    </p>

                    <p className="text-gray-700">
                      {version.summary}
                    </p>
                  </div>
                )}

                {version.extractedText && (
                  <details className="mt-5">
                    <summary className="cursor-pointer font-medium text-blue-600">
                      View extracted text
                    </summary>

                    <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">
                      {
                        version.extractedText
                      }
                    </p>
                  </details>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}