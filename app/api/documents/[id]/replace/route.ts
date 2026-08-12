import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { prisma } from "@/lib/prisma";
import { extractText } from "@/lib/extractors/extractText";
import { summarizeText, analyzeSentiment } from "@/lib/ai";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Get document ID
    // --------------------------------------------------

    const { id } = await params;

    const documentId = Number(id);

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document ID",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Get logged-in user
    // --------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 4. IMPORTANT: Verify document ownership
    // --------------------------------------------------

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: user.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found or access denied",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Get replacement file
    // --------------------------------------------------

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No replacement file uploaded",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Save complete old version
    // --------------------------------------------------

    await prisma.documentVersion.create({
      data: {
        documentId: document.id,

        name: document.name,

        fileType: document.fileType,

        filePath: document.filePath,

        fileSize: document.fileSize,

        extractedText:
          document.extractedText || "",

        summary: document.summary,

        sentiment: document.sentiment,

        category: document.category,
      },
    });

    console.log(
      "Complete old version saved:",
      document.id
    );

    // --------------------------------------------------
    // 7. Create upload directory
    // --------------------------------------------------

    const uploadDir = path.join(
      process.cwd(),
      "uploads"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    // --------------------------------------------------
    // 8. Save new file
    // --------------------------------------------------

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const safeFileName =
      `${Date.now()}-${file.name}`;

    const filePath = path.join(
      uploadDir,
      safeFileName
    );

    fs.writeFileSync(filePath, buffer);

    // --------------------------------------------------
    // 9. Extract text
    // --------------------------------------------------

    let extractedText = "";

    try {
      extractedText =
        await extractText(filePath);

      console.log(
        "Replacement text extracted successfully."
      );
    } catch (error) {
      console.error(
        "Replacement text extraction failed:",
        error
      );
    }

    // --------------------------------------------------
    // 10. Generate summary
    // --------------------------------------------------

    let summary = "";

    try {
      summary =
        await summarizeText(
          extractedText
        );
    } catch (error) {
      console.error(
        "Replacement summary failed:",
        error
      );
    }

    // --------------------------------------------------
    // 11. Analyze sentiment
    // --------------------------------------------------

    let sentiment = "";

    try {
      sentiment =
        await analyzeSentiment(
          extractedText
        );
    } catch (error) {
      console.error(
        "Replacement sentiment analysis failed:",
        error
      );
    }

    // --------------------------------------------------
    // 12. Determine category
    // --------------------------------------------------

    let category = "General";

    const fileNameLower =
      file.name.toLowerCase();

    const fileTypeLower =
      file.type.toLowerCase();

    if (fileTypeLower.includes("pdf")) {
      category = "PDF Document";
    } else if (
      fileTypeLower.includes("word") ||
      fileNameLower.endsWith(".docx")
    ) {
      category = "Word Document";
    } else if (
      fileTypeLower.includes("text") ||
      fileNameLower.endsWith(".txt")
    ) {
      category = "Text File";
    } else if (
      fileTypeLower.includes("csv") ||
      fileNameLower.endsWith(".csv")
    ) {
      category = "Dataset";
    } else if (
      fileTypeLower.includes("zip") ||
      fileNameLower.endsWith(".zip")
    ) {
      category = "Archive";
    }

    // --------------------------------------------------
    // 13. Update current document
    // --------------------------------------------------

    await prisma.document.update({
      where: {
        id: document.id,
      },

      data: {
        name: file.name,

        fileType: file.type,

        filePath,

        fileSize: file.size,

        extractedText,

        summary,

        sentiment,

        category,
      },
    });

    console.log(
      "Document replaced successfully:",
      document.id
    );

    // --------------------------------------------------
    // 14. Return success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Document replaced successfully.",
    });
  } catch (error) {
    console.error(
      "Replace document error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to replace document.",
      },
      {
        status: 500,
      }
    );
  }
}