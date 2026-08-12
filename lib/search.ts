export function searchDocuments(
  question: string,
  texts: string[]
) {
  const queryWords = question
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  let bestChunk = "";
  let bestScore = 0;

  for (const text of texts) {
    const paragraphs = text
      .split(/\n\s*\n|\.\s+/)
      .filter(Boolean);

    for (const paragraph of paragraphs) {
      const lower = paragraph.toLowerCase();

      let score = 0;

      for (const word of queryWords) {
        if (lower.includes(word)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestChunk = paragraph.trim();
      }
    }
  }

  return {
    score: bestScore,
    text: bestChunk,
  };
}