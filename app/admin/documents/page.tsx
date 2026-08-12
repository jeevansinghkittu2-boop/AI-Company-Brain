import { prisma } from "@/lib/prisma";
import AdminDocuments from "../../../components/AdminDocuments";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    include: {
      user: true,
      folder: true,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  const formattedDocuments = documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    fileType: doc.fileType,
    category: doc.category,
    sentiment: doc.sentiment,
    uploadedAt: doc.uploadedAt.toISOString(),
    user: {
      id: doc.user.id,
      name: doc.user.name,
      email: doc.user.email,
    },
    folder: doc.folder
      ? {
          id: doc.folder.id,
          name: doc.folder.name,
        }
      : null,
  }));

  return (
    <AdminDocuments
      documents={formattedDocuments}
    />
  );
}