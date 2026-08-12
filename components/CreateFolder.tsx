"use client";

import { useState } from "react";

export default function CreateFolder() {
  const [name, setName] = useState("");

  async function createFolder() {
    if (!name.trim()) return;

    await fetch("/api/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    location.reload();
  }

  return (
    <div className="flex gap-3 mb-6">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Folder name"
        className="border rounded-lg p-2 flex-1"
      />

      <button
        onClick={createFolder}
        className="bg-blue-600 text-white px-4 rounded-lg"
      >
        Create Folder
      </button>
    </div>
  );
}