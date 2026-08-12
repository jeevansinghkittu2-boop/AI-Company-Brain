import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSimilarDocuments } from "@/lib/similarity";

import ReplaceDocument from "@/components/ReplaceDocument";
import VersionHistory from "@/components/VersionHistory";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentDetails({
  params,
}: PageProps) {
  // --------------------------------------------------
  // 1. Get document ID
  // --------------------------------------------------

  const { id } = await params;

  const documentId = Number(id);

  if (!Number.isInteger(documentId)) {
    notFound();
  }

  // --------------------------------------------------
  // 2. Check authentication
  // --------------------------------------------------

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // --------------------------------------------------
  // 3. Find logged-in user
  // --------------------------------------------------

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // 4. IMPORTANT: Get document AND verify ownership
  // --------------------------------------------------

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  // If document does not belong to logged-in user,
  // do not expose whether it exists.
  if (!document) {
    notFound();
  }

  // --------------------------------------------------
  // 5. Document analytics
  // --------------------------------------------------

  const text = document.extractedText || "";

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const characterCount = text.length;

  const readingTime = Math.max(
    1,
    Math.ceil(wordCount / 200)
  );

  // --------------------------------------------------
  // 6. Get ONLY this user's other documents
  // --------------------------------------------------

  const allDocuments = await prisma.document.findMany({
    where: {
      userId: user.id,
      NOT: {
        id: document.id,
      },
    },
    select: {
      id: true,
      name: true,
      extractedText: true,
    },
  });

  // --------------------------------------------------
  // 7. Find similar documents
  // --------------------------------------------------

  const similarDocuments = getSimilarDocuments(
    document.extractedText || "",
    allDocuments
  );

  // --------------------------------------------------
  // 8. Render page
  // --------------------------------------------------

  return (
    <div className="p-8">
      {/* Back */}
      <div className="mb-6">
        <Link
          href="/documents"
          className="text-blue-600 hover:underline"
        >
          ← Back to Documents
        </Link>
      </div>

      {/* Document name */}
      <h1 className="text-3xl font-bold mb-6">
        {document.name}
      </h1>

      {/* Summary */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Summary
        </h2>

        <p>
          {document.summary ||
            "No summary available."}
        </p>
      </div>

      {/* Sentiment */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Sentiment
        </h2>

        <p>
          {document.sentiment || "Unknown"}
        </p>
      </div>

      {/* Category */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Category
        </h2>

        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
          {document.category || "General"}
        </span>
      </div>

      {/* Analytics */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Document Analytics
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">
              Word Count
            </p>

            <p className="text-2xl font-bold">
              {wordCount.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Characters
            </p>

            <p className="text-2xl font-bold">
              {characterCount.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Reading Time
            </p>

            <p className="text-2xl font-bold">
              {readingTime} min
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Uploaded
            </p>

            <p className="font-semibold">
              {document.uploadedAt.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Document Management */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">
          Document Management
        </h2>

        <ReplaceDocument
          documentId={document.id}
        />
      </div>

      {/* Extracted Text */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Extracted Text
        </h2>

        <pre className="whitespace-pre-wrap break-words">
          {document.extractedText ||
            "No extracted text."}
        </pre>
      </div>

      {/* Similar Documents */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Similar Documents
        </h2>

        {similarDocuments.length === 0 ? (
          <p>
            No similar documents found.
          </p>
        ) : (
          <div className="space-y-3">
            {similarDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <Link
                  href={`/documents/${doc.id}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {doc.name}
                </Link>

                <p className="text-sm text-gray-500 mt-1">
                  Similarity Score: {doc.score}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version History */}
      <VersionHistory
        documentId={document.id}
      />
    </div>
  );
}