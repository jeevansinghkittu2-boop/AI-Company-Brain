"use client";

import {
  useRef,
  useState,
  ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";

interface ReplaceDocumentProps {
  documentId: number;
}

export default function ReplaceDocument({
  documentId,
}: ReplaceDocumentProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleReplace(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      "Replace this document? The current version will be saved in version history."
    );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `/api/documents/${documentId}/replace`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to replace document."
        );

        return;
      }

      alert(
        "Document replaced successfully."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Replace error:",
        error
      );

      alert(
        "Something went wrong while replacing the document."
      );
    } finally {
      setLoading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleReplace}
        disabled={loading}
      />

      <button
        type="button"
        onClick={() =>
          inputRef.current?.click()
        }
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Replacing..."
          : "Replace Document"}
      </button>
    </div>
  );
}