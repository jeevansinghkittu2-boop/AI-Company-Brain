import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-6">
        AI Company Brain
      </h1>

      <p className="text-xl text-gray-400 mb-8">
        Enterprise Knowledge Platform
      </p>

      <Link
        href="/dashboard"
        className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}