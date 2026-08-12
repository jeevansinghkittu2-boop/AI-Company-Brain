"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  id: number;
}

export default function DeleteButton({
  id,
}: DeleteButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) return;
const loadingToast = toast.loading("Deleting document...");
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Document deleted successfully!");
      router.refresh();
    } else {
     toast.dismiss(loadingToast);
     toast.success("Document deleted successfully!");

     window.location.reload();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
    >
      Delete
    </button>
  );
}