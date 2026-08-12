"use client";

import { Eye } from "lucide-react";

export default function PreviewButton({
  id,
}: {
  id: number;
}) {
  return (
    <a
      href={`/api/documents/${id}/preview`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
    >
      <Eye size={18} />
      Preview
    </a>
  );
}