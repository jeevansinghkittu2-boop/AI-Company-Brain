import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;
  }

  if (ext === ".pdf") {
    throw new Error(
      "PDF extraction will be handled by Azure Document Intelligence."
    );
  }

  throw new Error("Unsupported file type");
}