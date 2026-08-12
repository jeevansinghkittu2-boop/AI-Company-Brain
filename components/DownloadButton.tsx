"use client";

export default function DownloadButton({
  id,
}: {
  id: number;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        window.location.href = `/api/download/${id}`;
      }}
      className="mt-4 ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
      Download
    </button>
  );
}