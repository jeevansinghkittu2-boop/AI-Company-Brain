import { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
}

export default function Card({
  title,
  value,
  icon,
  color,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border-t-4 ${color}
      p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>
        </div>

        <div className="text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}