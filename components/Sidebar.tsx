"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Upload,
  Search,
  MessageSquare,
  Workflow,
  Settings,
  Star,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">
        AI Company Brain
      </h1>

      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:text-blue-400"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/upload"
          className="flex items-center gap-3 hover:text-blue-400"
        >
          <Upload size={20} />
          Upload
        </Link>
<Link href="/graph">
  Knowledge Graph
</Link>

   <Link
  href="/documents"
  className="flex items-center gap-3 hover:text-blue-400"
>
  📄 Documents
</Link>

<Link
  href="/favorites"
  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
>
  <Star size={20} />
  Favorites
</Link>
<Link
  href="/search"
  className="flex items-center gap-3 hover:text-blue-400"
>
  <Search size={20} />
  Search
</Link>

        <Link
          href="/chat"
          className="flex items-center gap-3 hover:text-blue-400"
        >
          <MessageSquare size={20} />
          AI Chat
        </Link>

        <Link
          href="/graph"
          className="flex items-center gap-3 hover:text-blue-400"
        >
          <Workflow size={20} />
          Knowledge Graph
        </Link>
        
        
        <Link
          href="/settings"
          className="flex items-center gap-3 hover:text-blue-400"
        >
          <Settings size={20} />
          Settings
        </Link>
      </nav>
    </aside>
  );
}