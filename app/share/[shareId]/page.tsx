import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default async function SharedDocumentPage({
  params,
}: PageProps) {
  const { shareId } = await params;

  // Find publicly shared document
  const document = await prisma.document.findFirst({
    where: {
      shareId,
      isPublic: true,
    },
  });

  // If link is invalid or sharing is disabled
  if (!document) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {document.name}
              </h1>

              <p className="text-gray-500 mt-2">
                {document.fileType}
              </p>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              Public Document
            </span>
          </div>
        </div>

        {/* Document Information */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Document Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="font-medium mt-1">
                {document.category || "General"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Sentiment
              </p>

              <p className="font-medium mt-1">
                {document.sentiment || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Uploaded
              </p>

              <p className="font-medium mt-1">
                {document.uploadedAt.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">
            AI Summary
          </h2>

          <p className="text-gray-700 whitespace-pre-wrap">
            {document.summary ||
              "No summary available."}
          </p>
        </div>

        {/* Extracted Text */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Document Content
          </h2>

          <div className="border rounded-xl p-5 bg-gray-50">
            <p className="whitespace-pre-wrap break-words text-gray-700">
              {document.extractedText ||
                "No extracted text available."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Shared using AI Company Brain
        </div>
      </div>
    </div>
  );
}