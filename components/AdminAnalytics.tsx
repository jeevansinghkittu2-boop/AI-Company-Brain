"use client";

interface AdminAnalyticsProps {
  pdf: number;
  word: number;
  text: number;
  positive: number;
  neutral: number;
  negative: number;
}

export default function AdminAnalytics({
  pdf,
  word,
  text,
  positive,
  neutral,
  negative,
}: AdminAnalyticsProps) {
  return (
    <div className="space-y-8 mt-8">

      {/* File Types */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          Document File Types
        </h2>

        <div className="space-y-4">

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">
                PDF
              </span>

              <span>
                {pdf}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full"
                style={{
                  width: `${Math.min(pdf * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">
                Word
              </span>

              <span>
                {word}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{
                  width: `${Math.min(word * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">
                Text
              </span>

              <span>
                {text}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width: `${Math.min(text * 10, 100)}%`,
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Sentiment */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          Document Sentiment
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-green-100 rounded-xl p-5">
            <p className="text-green-700 font-semibold">
              Positive
            </p>

            <p className="text-4xl font-bold mt-2">
              {positive}
            </p>
          </div>

          <div className="bg-yellow-100 rounded-xl p-5">
            <p className="text-yellow-700 font-semibold">
              Neutral
            </p>

            <p className="text-4xl font-bold mt-2">
              {neutral}
            </p>
          </div>

          <div className="bg-red-100 rounded-xl p-5">
            <p className="text-red-700 font-semibold">
              Negative
            </p>

            <p className="text-4xl font-bold mt-2">
              {negative}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}