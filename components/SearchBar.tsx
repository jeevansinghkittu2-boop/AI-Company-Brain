"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch?: (value: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");

  return (
    <input
      type="text"
      placeholder="Search documents..."
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onSearch?.(e.target.value);
      }}
      className="w-full border border-gray-300 rounded-lg p-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}