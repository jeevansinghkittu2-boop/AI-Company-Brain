import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

import { prisma } from "@/lib/prisma";
import { extractText } from "@/lib/extractors/extractText";
import {
  summarizeText,
  analyzeSentiment,
} from "@/lib/ai";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// --------------------------------------------------
// Cloudinary configuration
// --------------------------------------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------------------------------------
// Upload buffer to Cloudinary
// --------------------------------------------------

function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "ai-company-brain",
          resource_type: "auto",
          public_id: `${Date.now()}-${path
            .basename(fileName)
            .replace(/\.[^/.]+$/, "")}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(
              new Error(
                "Cloudinary did not return a secure URL."
              )
            );
            return;
          }

          resolve(result.secure_url);
        }
      );

    uploadStream.end(buffer);
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  let temporaryFilePath: string | null = null;

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
    // 4. Verify document ownership
    // --------------------------------------------------

    const document =
      await prisma.document.findFirst({
        where: {
          id: documentId,
          userId: user.id,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found or access denied",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Get replacement file
    // --------------------------------------------------

    const formData =
      await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No replacement file uploaded",
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
    // 7. Read replacement file into memory
    // --------------------------------------------------

    const bytes =
      await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    // --------------------------------------------------
    // 8. Create temporary file for text extraction
    // --------------------------------------------------
    //
    // Your existing extractText() function expects
    // a file path. We therefore temporarily save the
    // file, extract the text, and delete the temp file.
    //
    // The actual permanent file is stored in Cloudinary.
    // --------------------------------------------------

    const tempDirectory =
      path.join(
        os.tmpdir(),
        "ai-company-brain"
      );

    if (!fs.existsSync(tempDirectory)) {
      fs.mkdirSync(tempDirectory, {
        recursive: true,
      });
    }

    const safeFileName =
      `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;

    temporaryFilePath =
      path.join(
        tempDirectory,
        safeFileName
      );

    fs.writeFileSync(
      temporaryFilePath,
      buffer
    );

    // --------------------------------------------------
    // 9. Extract text
    // --------------------------------------------------

    let extractedText = "";

    try {
      extractedText =
        await extractText(
          temporaryFilePath
        );

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

    if (
      fileTypeLower.includes("pdf") ||
      fileNameLower.endsWith(".pdf")
    ) {
      category = "PDF Document";
    } else if (
      fileTypeLower.includes("word") ||
      fileNameLower.endsWith(".docx") ||
      fileNameLower.endsWith(".doc")
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
    // 13. Upload replacement to Cloudinary
    // --------------------------------------------------

    console.log(
      "Uploading replacement to Cloudinary..."
    );

    const cloudinaryUrl =
      await uploadToCloudinary(
        buffer,
        file.name,
        file.type
      );

    console.log(
      "Replacement uploaded to Cloudinary:",
      cloudinaryUrl
    );

    // --------------------------------------------------
    // 14. Update current document
    // --------------------------------------------------

    await prisma.document.update({
      where: {
        id: document.id,
      },

      data: {
        name: file.name,

        fileType:
          file.type ||
          "application/octet-stream",

        // IMPORTANT:
        // Store Cloudinary URL instead of
        // a local Windows file path.
        filePath: cloudinaryUrl,

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
    // 15. Delete temporary file
    // --------------------------------------------------

    if (
      temporaryFilePath &&
      fs.existsSync(temporaryFilePath)
    ) {
      fs.unlinkSync(
        temporaryFilePath
      );

      temporaryFilePath = null;
    }

    // --------------------------------------------------
    // 16. Return success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Document replaced successfully.",
      documentId: document.id,
      fileUrl: cloudinaryUrl,
    });
  } catch (error) {
    console.error(
      "Replace document error:",
      error
    );

    // --------------------------------------------------
    // Cleanup temporary file if something failed
    // --------------------------------------------------

    if (
      temporaryFilePath &&
      fs.existsSync(temporaryFilePath)
    ) {
      try {
        fs.unlinkSync(
          temporaryFilePath
        );
      } catch (cleanupError) {
        console.error(
          "Temporary file cleanup failed:",
          cleanupError
        );
      }
    }

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