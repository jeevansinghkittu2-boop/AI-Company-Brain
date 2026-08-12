import Link from "next/link";
import {
  FileText,
  File,
  FileSpreadsheet,
  Users,
  Upload,
  MessageCircle,
  Network,
  HardDrive,
  Tag,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import FileTypeChart from "@/components/FileTypeChart";
import SentimentChart from "@/components/SentimentChart";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import ActivityTimeline from "@/components/ActivityTimeline";
import UploadTrendChart from "@/components/UploadTrendChart";
import ExportDashboardPDF from "@/components/ExportDashboardPDF";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
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

  const documentCount = await prisma.document.count({
    where: {
      userId: user.id,
    },
  });

  const latestDocuments = await prisma.document.findMany({
    where: {
      userId: user.id,
    },
    take: 5,
    orderBy: {
      uploadedAt: "desc",
    },
  });

  const documents = await prisma.document.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  const uploadMap: Record<string, number> = {};

documents.forEach((doc) => {
  const day = doc.uploadedAt.toLocaleDateString("en-US", {
    weekday: "short",
  });

  uploadMap[day] = (uploadMap[day] || 0) + 1;
});

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const uploadTrendData = days.map((day) => ({
  day,
  uploads: uploadMap[day] || 0,
}));
const totalWords = documents.reduce((total, doc) => {
  if (!doc.extractedText) return total;

  return (
    total +
    doc.extractedText
      .trim()
      .split(/\s+/)
      .filter(Boolean).length
  );
}, 0);

const averageWords =
  documentCount > 0
    ? Math.round(totalWords / documentCount)
    : 0;

const totalStorageBytes = documents.reduce((total, doc) => {
  try {
    const fs = require("fs");

    if (fs.existsSync(doc.filePath)) {
      return total + fs.statSync(doc.filePath).size;
    }
  } catch {}

  return total;
}, 0);

const storageMB = (
  totalStorageBytes /
  (1024 * 1024)
).toFixed(2);

const averageFileSize =
  documentCount > 0
    ? (Number(storageMB) / documentCount).toFixed(2)
    : "0";

const lastUpload =
  latestDocuments.length > 0
    ? latestDocuments[0].uploadedAt.toLocaleString()
    : "No uploads";
console.log(documents);
const pdfCount = documents.filter(d =>
  d.fileType.includes("pdf")
).length;

const txtCount = documents.filter(d =>
  d.fileType.includes("text")
).length;
const positiveCount = documents.filter(
  (d) => d.sentiment === "Positive"
).length;

const neutralCount = documents.filter(
  (d) => d.sentiment === "Neutral"
).length;

const negativeCount = documents.filter(
  (d) => d.sentiment === "Negative"
).length;
const categorizedCount = documents.filter(
  (d) => d.category && d.category !== "General"
).length;
const totalDocuments = documentCount;

const positiveDocuments = positiveCount;
const neutralDocuments = neutralCount;
const negativeDocuments = negativeCount;
const sentimentData = [
  { name: "Positive", value: positiveCount },
  { name: "Neutral", value: neutralCount },
  { name: "Negative", value: negativeCount },
];
console.log("Positive:", positiveCount);
console.log("Neutral:", neutralCount);
console.log("Negative:", negativeCount);
const docxCount = documents.filter(d =>
  d.fileType.includes("word") ||
  d.name.endsWith(".docx")
).length;

const chartData = [
  { name: "PDF", value: pdfCount },
  { name: "DOCX", value: docxCount },
  { name: "TXT", value: txtCount },
];
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-100">
        <Navbar />

        <main className="p-8">
          <h1 className="text-3xl font-bold text-gray-800">
            AI Company Brain Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome! Manage documents, search your knowledge base, chat with AI,
            and explore your knowledge graph.
          </p>
          <div className="mt-6">
  <SearchBar />
</div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

<Card
title="Documents"
value={totalDocuments.toString()}
icon={<FileText size={40} />}
color="border-blue-500"
/>

<Card
title="PDF Files"
value={pdfCount.toString()}
icon={<File size={40} />}
color="border-red-500"
/>

<Card
title="DOCX Files"
value={docxCount.toString()}
icon={<FileSpreadsheet size={40} />}
color="border-green-500"
/>


<Card
  title="Knowledge Graph"
  value={documentCount.toString()}
  icon={<Network size={40} />}
  color="border-indigo-500"
/>
<Card
  title="Categorized Docs"
  value={categorizedCount.toString()}
  icon={<Tag size={40} />}
  color="border-yellow-500"
/>
<Card
  title="Total Words"
  value={totalWords.toLocaleString()}
  icon={<FileText size={40} />}
  color="border-orange-500"
/>
<Card
  title="Storage Used"
  value={`${storageMB} MB`}
  icon={<HardDrive size={40} />}
  color="border-cyan-500"
/>
<Card
  title="Average Words / Doc"
  value={averageWords.toString()}
  icon={<Users size={40} />}
  color="border-purple-500"
/>

<Card
  title="Positive Docs"
  value={positiveDocuments.toString()}
  icon={<Users size={40} />}
  color="border-emerald-500"
/>
<Card
  title="Neutral Docs"
  value={neutralDocuments.toString()}
  icon={<Users size={40} />}
  color="border-amber-500"
/>

<Card
  title="Negative Docs"
  value={negativeDocuments.toString()}
  icon={<Users size={40} />}
  color="border-red-500"
/>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
  <FileTypeChart data={chartData} />
  <SentimentChart data={sentimentData} />
  <UploadTrendChart data={uploadTrendData} />
</div>
<div className="mt-8 flex justify-end">
  <ExportDashboardPDF
    totalDocuments={documentCount}
    pdfCount={pdfCount}
    docxCount={docxCount}
    txtCount={txtCount}
    totalWords={totalWords}
    storageMB={storageMB}
    positive={positiveCount}
    neutral={neutralCount}
    negative={negativeCount}
    averageWords={averageWords}
  />
</div>
<div className="flex gap-4 mt-8">

<Link
href="/upload"
className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700"
>
<Upload size={20}/>
Upload Document
</Link>

<Link
href="/documents"
className="bg-green-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700"
>
<FileText size={20}/>
View Documents
</Link>

<Link
href="/chat"
className="bg-purple-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-purple-700"
>
<MessageCircle size={20}/>
AI Chat
</Link>

</div>
          <div className="mt-10 bg-white rounded-xl shadow p-6">
  <h2 className="text-2xl font-bold mb-4">
    Recent Documents
  </h2>

  {latestDocuments.length === 0 ? (
    <p>No documents uploaded.</p>
  ) : (
    <ul className="space-y-3">
      {latestDocuments.map((doc) => (
        <li
          key={doc.id}
          className="border-b pb-2"
        >
          <div className="font-semibold">
            {doc.name}
          </div>

          <div className="text-sm text-gray-500">
            {doc.uploadedAt.toLocaleString()}
          </div>
          
        </li>
      ))}
    </ul>
  )}
</div>
<div className="mt-10 bg-white rounded-xl shadow p-6">
  <h2 className="text-2xl font-bold mb-6">
    Quick Insights
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    <div className="bg-blue-50 rounded-xl p-5">
      <p className="text-gray-500">Documents</p>
      <h3 className="text-3xl font-bold">
        {documentCount}
      </h3>
    </div>

    <div className="bg-green-50 rounded-xl p-5">
      <p className="text-gray-500">Positive Documents</p>
      <h3 className="text-3xl font-bold">
        {positiveCount}
      </h3>
    </div>

    <div className="bg-yellow-50 rounded-xl p-5">
      <p className="text-gray-500">Average File Size</p>
      <h3 className="text-3xl font-bold">
        {averageFileSize} MB
      </h3>
    </div>

    <div className="bg-purple-50 rounded-xl p-5">
      <p className="text-gray-500">Last Upload</p>
      <h3 className="text-lg font-bold">
        {lastUpload}
      </h3>
    </div>

  </div>
</div>
<div className="mt-10">
  <KnowledgeGraph />
</div>
<div className="mt-8">
  <ActivityTimeline activities={latestDocuments} />
</div>

</main>
      </div>
    </div>
  );
}