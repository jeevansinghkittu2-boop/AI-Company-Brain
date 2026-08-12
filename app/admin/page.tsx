import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminCharts from "@/components/AdminCharts";
import AdminAnalytics from "../../components/AdminAnalytics";

export default async function AdminPage() {
  // Check logged-in user
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

 const user = await prisma.user.findUnique({
  where: {
    email: session.user.email,
  },
});

if (!user || user.role !== "ADMIN") {
  redirect("/");
}

  const totalUsers = await prisma.user.count();

  const totalDocuments = await prisma.document.count();

  const totalFolders = await prisma.folder.count();

  const positive = await prisma.document.count({
    where: {
      sentiment: "Positive",
    },
  });

  const neutral = await prisma.document.count({
    where: {
      sentiment: "Neutral",
    },
  });

  const negative = await prisma.document.count({
    where: {
      sentiment: "Negative",
    },
  });

  const pdf = await prisma.document.count({
    where: {
      fileType: {
        contains: "pdf",
      },
    },
  });

  const word = await prisma.document.count({
    where: {
      OR: [
        {
          fileType: {
            contains: "word",
          },
        },
        {
          name: {
            endsWith: ".docx",
          },
        },
      ],
    },
  });

  const text = await prisma.document.count({
    where: {
      fileType: {
        contains: "text",
      },
    },
  });

  const recentUploads = await prisma.document.findMany({
    orderBy: {
      uploadedAt: "desc",
    },
    take: 5,
  });

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {/* Main Statistics */}

     <div className="grid md:grid-cols-3 gap-6">
  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Users</p>
    <h2 className="text-4xl font-bold">
      {totalUsers}
    </h2>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Documents</p>
    <h2 className="text-4xl font-bold">
      {totalDocuments}
    </h2>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Folders</p>
    <h2 className="text-4xl font-bold">
      {totalFolders}
    </h2>
  </div>
</div>

<AdminAnalytics
  pdf={pdf}
  word={word}
  text={text}
  positive={positive}
  neutral={neutral}
  negative={negative}
/>

      {/* Recent Uploads */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Recent Uploads
        </h2>

        <div className="space-y-4">
          {recentUploads.map((doc) => (
            <div
              key={doc.id}
              className="border-b pb-3"
            >
              <p className="font-semibold">{doc.name}</p>

              <p className="text-gray-500 text-sm">
                {doc.uploadedAt.toLocaleString()}
              </p>
              
            </div>
            
          ))}
        </div>
      </div>
      <AdminCharts
  positive={positive}
  neutral={neutral}
  negative={negative}
  pdf={pdf}
  word={word}
  text={text}
/>
    </div>
  );
}