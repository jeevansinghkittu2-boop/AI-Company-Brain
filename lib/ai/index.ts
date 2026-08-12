import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeText(text: string): Promise<string> {
  try {
    if (!text.trim()) return "";

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Summarize this document in 3-5 concise sentences.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content ?? "";
  } catch (error) {
    console.log("OpenAI unavailable. Using local summary.");

    // Fallback summary
    return text.length > 300 ? text.substring(0, 300) + "..." : text;
  }
}

export async function analyzeSentiment(text: string): Promise<string> {
  try {
    if (!text.trim()) return "Neutral";
console.log("Calling OpenAI...");

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Reply with only Positive, Negative or Neutral.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 10,
    });

    return response.choices[0].message.content?.trim() ?? "Neutral";
    console.log("OpenAI responded successfully.");
  } catch (error) {
    console.log("OpenAI unavailable. Using local sentiment.");

    const lower = text.toLowerCase();

    if (
      lower.includes("good") ||
      lower.includes("excellent") ||
      lower.includes("happy")
    ) {
      return "Positive";
    }

    if (
      lower.includes("bad") ||
      lower.includes("poor") ||
      lower.includes("sad")
    ) {
      return "Negative";
    }

    return "Neutral";
  }
}
export async function answerQuestion(prompt: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant. Answer the user's question ONLY using the provided document information. Do not repeat the prompt or the document text. Give a clear and natural answer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() ?? "No answer.";
  } catch (error: any) {
  console.error("OpenAI Error:");
  console.error(error);

  return "AI is currently unavailable.";
}
}