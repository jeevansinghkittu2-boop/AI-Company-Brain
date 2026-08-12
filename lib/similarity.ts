export function getSimilarDocuments(
  currentText: string,
  documents: {
    id: number;
    name: string;
    extractedText: string | null;
  }[]
) {
  const currentWords = new Set(
    currentText.toLowerCase().split(/\W+/).filter(Boolean)
  );

  const scores = documents.map((doc) => {
    const words = new Set(
      (doc.extractedText || "")
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
    );

    let score = 0;

    currentWords.forEach((word) => {
      if (words.has(word)) {
        score++;
      }
    });

    return {
      ...doc,
      score,
    };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}