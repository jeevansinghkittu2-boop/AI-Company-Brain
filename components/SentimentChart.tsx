"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export default function SentimentChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 h-80">
      <h2 className="text-xl font-bold mb-4">
        Sentiment Distribution
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}