"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  id: number;
  initialFavorite: boolean;
}

export default function FavoriteButton({
  id,
  initialFavorite,
}: Props) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setFavorite(!favorite);

      toast.success(
        !favorite
          ? "Added to Favorites"
          : "Removed from Favorites"
      );
    } catch {
      toast.error("Unable to update favorite.");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggleFavorite}
      className="transition-transform hover:scale-110"
      title="Favorite"
    >
      <Star
        size={24}
        className={
          favorite
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-400"
        }
      />
    </button>
  );
}