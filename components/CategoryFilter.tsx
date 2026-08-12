"use client";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  "All",
  "PDF Document",
  "Word Document",
  "Text File",
  "Dataset",
  "Archive",
  "General",
];

export default function CategoryFilter({
  selected,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
         className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
  selected === category
    ? "bg-blue-600 text-white"
    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}