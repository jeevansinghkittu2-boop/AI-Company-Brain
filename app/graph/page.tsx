import { prisma } from "@/lib/prisma";

export default async function GraphPage() {
  const documents = await prisma.document.findMany();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Knowledge Graph
      </h1>

      <p className="text-gray-600 mb-8">
        Overview of all uploaded knowledge.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow p-6"
          >
            <h2 className="text-xl font-bold">
              {doc.name}
            </h2>

            <p className="text-gray-500 mt-2">
              {doc.summary || "No summary"}
            </p>

            <div className="mt-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {doc.sentiment || "Unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}