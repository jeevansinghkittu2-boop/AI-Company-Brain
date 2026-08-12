"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Props {
  positive: number;
  neutral: number;
  negative: number;

  pdf: number;
  word: number;
  text: number;
}

export default function AdminCharts({
  positive,
  neutral,
  negative,
  pdf,
  word,
  text,
}: Props) {
  const sentimentData = [
    { name: "Positive", value: positive },
    { name: "Neutral", value: neutral },
    { name: "Negative", value: negative },
  ];

  const fileData = [
    { type: "PDF", count: pdf },
    { type: "Word", count: word },
    { type: "Text", count: text },
  ];

  const COLORS = [
    "#22c55e",
    "#eab308",
    "#ef4444",
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-10">

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Sentiment Distribution
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <PieChart>
            <Pie
              data={sentimentData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {sentimentData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          File Types
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart data={fileData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="type" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="#2563eb"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}