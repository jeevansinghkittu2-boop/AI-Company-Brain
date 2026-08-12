"use client";

import { useRouter } from "next/navigation";

interface Folder {
  id: number;
  name: string;
}

interface MoveToFolderProps {
  documentId: number;
  currentFolderId: number | null;
  folders: Folder[];
}

export default function MoveToFolder({
  documentId,
  currentFolderId,
  folders,
}: MoveToFolderProps) {
  const router = useRouter();

  async function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    e.stopPropagation();

    const value = e.target.value;

    await fetch("/api/folders/move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        folderId: value === "" ? null : Number(value),
      }),
    });

    router.refresh();
  }

  return (
    <select
      defaultValue={currentFolderId ?? ""}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onChange={handleChange}
      className="border rounded-lg px-3 py-2 text-sm"
    >
      <option value="">No Folder</option>

      {folders.map((folder) => (
        <option key={folder.id} value={folder.id}>
          {folder.name}
        </option>
      ))}
    </select>
  );
}