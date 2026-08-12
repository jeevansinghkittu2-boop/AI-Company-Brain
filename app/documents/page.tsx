import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import MoveToFolder from "@/components/MoveToFolder";


import DocumentSearch from "@/components/DocumentSearch";
import DeleteButton from "@/components/DeleteButton";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";
import FavoriteButton from "@/components/FavoriteButton";
import CreateFolder from "@/components/CreateFolder";
import ShareButton from "@/components/ShareButton";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const folders = await prisma.folder.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      name: "asc",
    },
  });

const documents = await prisma.document.findMany({
  where: {
    userId: user.id,
  },
  include: {
    folder: true,
    tags: true,
  },
  orderBy: {
    uploadedAt: "desc",
  },
});

  const totalDocuments = documents.length;
  const favoriteDocuments = documents.filter(
  (doc) => doc.favorite
).length;
  const pdfFiles = documents.filter((d) =>
    d.fileType.includes("pdf")
  ).length;

  const wordFiles = documents.filter(
    (d) =>
      d.fileType.includes("word") ||
      d.name.endsWith(".docx")
  ).length;

  const textFiles = documents.filter((d) =>
    d.fileType.includes("text")
  ).length;

  const positiveFiles = documents.filter(
    (d) => d.sentiment === "Positive"
  ).length;

  const neutralFiles = documents.filter(
    (d) => d.sentiment === "Neutral"
  ).length;

  const negativeFiles = documents.filter(
    (d) => d.sentiment === "Negative"
  ).length;

  return (

 <div className="p-8">
  <h1 className="text-3xl font-bold mb-6">
    Uploaded Documents
  </h1>

  <div className="mb-6">
    <CreateFolder />
  </div>

  {folders.length > 0 && (
    <div className="flex flex-wrap gap-3 mb-6">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium"
        >
          📁 {folder.name}
        </div>
      ))}
    </div>
  )}

  {/* Sentiment Cards */}

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

    <div className="bg-green-100 rounded-xl shadow p-5">
      <p className="text-green-700 font-semibold">
        Positive
      </p>

      <h2 className="text-3xl font-bold">
        {positiveFiles}
      </h2>
    </div>

    <div className="bg-yellow-100 rounded-xl shadow p-5">
      <p className="text-yellow-700 font-semibold">
        Neutral
      </p>

      <h2 className="text-3xl font-bold">
        {neutralFiles}
      </h2>
    </div>

    <div className="bg-red-100 rounded-xl shadow p-5">
      <p className="text-red-700 font-semibold">
        Negative
      </p>

      <h2 className="text-3xl font-bold">
        {negativeFiles}
      </h2>
    </div>

  </div>

  {/* Statistics */}

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500">Documents</p>
      <h2 className="text-3xl font-bold">
        {totalDocuments}
      </h2>
    </div>

    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500">PDF</p>
      <h2 className="text-3xl font-bold">
        {pdfFiles}
      </h2>
    </div>

    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500">Word</p>
      <h2 className="text-3xl font-bold">
        {wordFiles}
      </h2>
    </div>

    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500">Text</p>
      <h2 className="text-3xl font-bold">
        {textFiles}
      </h2>
    </div>
    <div className="bg-yellow-50 rounded-xl shadow p-5">
  <p className="text-yellow-700 font-semibold">
    ⭐ Favorites
  </p>

  <h2 className="text-3xl font-bold">
    {favoriteDocuments}
  </h2>
</div>
  </div>

  <DocumentSearch documents={documents} />

  {documents.length === 0 ? (
    <p>No documents uploaded.</p>
  ) : (
    <div className="space-y-4">
             {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-xl shadow p-6"
        >
          <Link
            href={`/documents/${doc.id}`}
            className="block hover:opacity-90"
          >
            <h2 className="text-xl font-bold">
              {doc.name}
            </h2>

            <p className="text-gray-500 mt-1">
              {doc.fileType}
            </p>

      <div className="flex flex-wrap items-center gap-2 mt-3">

  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
    {doc.category || "General"}
  </span>

  {doc.folder && (
    <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
      📁 {doc.folder.name}
    </span>
  )}

  {doc.tags.map((tag) => (
    <span
      key={tag.id}
      className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
    >
      🏷 {tag.name}
    </span>
  ))}

</div>

            <p className="mt-3 text-sm text-gray-600">
              Uploaded: {doc.uploadedAt.toLocaleString()}
            </p>

            <p className="mt-4 line-clamp-3 text-gray-700">
              {doc.extractedText ||
                "No extracted text available."}
            </p>
          </Link>

         <div className="flex items-center gap-3 mt-6">
<div>
  <MoveToFolder
    documentId={doc.id}
    currentFolderId={doc.folderId}
    folders={folders}
  />
</div>

 <FavoriteButton
  id={doc.id}
  initialFavorite={doc.favorite}
/>

<PreviewButton id={doc.id} />

<DownloadButton id={doc.id} />

<ShareButton documentId={doc.id} />

<DeleteButton id={doc.id} />
</div>
        </div>
      ))}
    </div>
  )}
</div>
);
}