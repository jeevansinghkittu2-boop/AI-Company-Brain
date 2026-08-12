"use client";

import { useState } from "react";

interface ShareButtonProps {
  documentId: number;
}

export default function ShareButton({
  documentId,
}: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to generate share link.");
        return;
      }

      const url =
        window.location.origin + data.shareUrl;

      await navigator.clipboard.writeText(url);

      alert("Share link copied!\n\n" + url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
    >
      {loading ? "Sharing..." : "Share"}
    </button>
  );
}