import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FavoriteButton from "@/components/FavoriteButton";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";
import DeleteButton from "@/components/DeleteButton";

export default async function FavoritesPage() {
  const documents = await prisma.document.findMany({
    where: {
      favorite: true,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        ⭐ Favorite Documents
      </h1>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">
            No favorite documents yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow p-6"
            >
              <Link href={`/documents/${doc.id}`}>
                <h2 className="text-xl font-bold">
                  {doc.name}
                </h2>

                <p className="text-gray-500">
                  {doc.fileType}
                </p>

                <p className="mt-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {doc.category}
                  </span>
                </p>
              </Link>

              <div className="flex items-center gap-3 mt-5">
                <FavoriteButton
                  id={doc.id}
                  initialFavorite={doc.favorite}
                />

                <PreviewButton id={doc.id} />

                <DownloadButton id={doc.id} />

                <DeleteButton id={doc.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}