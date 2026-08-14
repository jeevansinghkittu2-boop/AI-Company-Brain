"use client";

export default function DownloadButton({
  id,
}: {
  id: number;
}) {
  const handleDownload = () => {
    window.location.href = `/api/documents/${id}/download`;
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="mt-4 ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
      Download
    </button>
  );
}