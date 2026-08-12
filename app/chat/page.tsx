"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  async function askAI() {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentQuestion = question;
    setQuestion("");

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        AI Company Brain Chat
      </h1>

      <div className="bg-white rounded-2xl shadow-lg border h-[600px] overflow-y-auto p-6 space-y-5">

        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-32">
            <h2 className="text-2xl font-semibold">
              Ask anything about your uploaded documents
            </h2>

            <p className="mt-2">
              Example:
              <br />
              "Explain CPU Scheduling"
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-4 shadow ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <div className="font-bold mb-2">
                {msg.role === "user" ? "You" : "AI Assistant"}
              </div>

              <div className="whitespace-pre-wrap leading-7">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-black rounded-xl px-5 py-3">
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your documents..."
          className="flex-1 border-2 rounded-xl p-4 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAI();
            }
          }}
        />

        <button
          onClick={askAI}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 rounded-xl transition"
        >
          {loading ? "Thinking..." : "Send"}
        </button>

      </div>
    </div>
  );
}