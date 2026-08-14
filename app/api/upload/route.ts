import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";

import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { extractText } from "@/lib/extractors/extractText";
import { summarizeText, analyzeSentiment } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  let temporaryFilePath = "";

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
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // 2. Get uploaded file
    // --------------------------------------------------

    const formData = await request.formData();

    const file = formData.get("file");
    const tags = formData.get("tags")?.toString() || "";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        {
          status: 400,
        }
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
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 4. Convert uploaded file to Buffer
    // --------------------------------------------------

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --------------------------------------------------
    // 5. Create temporary file
    //
    // We need a temporary physical file because the
    // existing extractText() function works with a path.
    // --------------------------------------------------

    const temporaryDirectory = os.tmpdir();

    const safeTemporaryName =
      `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    temporaryFilePath = path.join(
      temporaryDirectory,
      safeTemporaryName
    );

    fs.writeFileSync(
      temporaryFilePath,
      buffer
    );

    // --------------------------------------------------
    // 6. Extract text
    // --------------------------------------------------

    let extractedText = "";

    try {
      extractedText = await extractText(
        temporaryFilePath
      );

      console.log(
        "Text extracted successfully."
      );
    } catch (error) {
      console.error(
        "Extraction skipped:",
        error
      );
    }

    // --------------------------------------------------
    // 7. Generate AI summary
    // --------------------------------------------------

    let summary = "";

    try {
      summary = await summarizeText(
        extractedText
      );

      console.log(
        "Summary generated successfully."
      );
    } catch (error) {
      console.error(
        "Summary generation failed:",
        error
      );
    }

    // --------------------------------------------------
    // 8. Analyze sentiment
    // --------------------------------------------------

    let sentiment = "";

    try {
      sentiment = await analyzeSentiment(
        extractedText
      );

      console.log(
        "Sentiment analyzed successfully."
      );
    } catch (error) {
      console.error(
        "Sentiment analysis failed:",
        error
      );
    }

    // --------------------------------------------------
    // 9. Determine category
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
    // 10. Prepare tags
    // --------------------------------------------------

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // --------------------------------------------------
    // 11. Upload file to Cloudinary
    // --------------------------------------------------

    const cloudinaryPublicId =
      `documents/${user.id}/${Date.now()}-${fileNameLower
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9_-]/g, "_")}`;

    const cloudinaryResult =
      await new Promise<{
        secure_url: string;
        public_id: string;
        resource_type: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              public_id: cloudinaryPublicId,
              use_filename: false,
              unique_filename: false,
              overwrite: false,
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(
                  new Error(
                    "Cloudinary upload returned no result."
                  )
                );
                return;
              }

              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                resource_type:
                  result.resource_type,
              });
            }
          );

        uploadStream.end(buffer);
      });

    console.log(
      "Cloudinary upload successful:",
      cloudinaryResult.secure_url
    );

    // --------------------------------------------------
    // 12. Save document in Neon PostgreSQL
    // --------------------------------------------------

    await prisma.document.create({
      data: {
        name: file.name,

        fileType:
          file.type ||
          "application/octet-stream",

        // IMPORTANT:
        // filePath now contains the Cloudinary URL.
        filePath:
          cloudinaryResult.secure_url,

        fileSize: file.size,

        extractedText,

        summary,

        sentiment,

        category,

        userId: user.id,

        tags: {
          connectOrCreate:
            tagList.map((tag) => ({
              where: {
                name: tag,
              },
              create: {
                name: tag,
              },
            })),
        },
      },
    });

    // --------------------------------------------------
    // 13. Activity log
    // --------------------------------------------------

    await logActivity({
      action: "Uploaded Document",
      target: file.name,
      userName:
        user.name ?? "Unknown User",
      userEmail: user.email,
    });

    // --------------------------------------------------
    // 14. Delete temporary file
    // --------------------------------------------------

    try {
      if (
        temporaryFilePath &&
        fs.existsSync(temporaryFilePath)
      ) {
        fs.unlinkSync(
          temporaryFilePath
        );
      }
    } catch (cleanupError) {
      console.error(
        "Temporary file cleanup failed:",
        cleanupError
      );
    }

    // --------------------------------------------------
    // 15. Success response
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "File uploaded successfully!",
      filename: file.name,
    });
  } catch (error) {
    console.error(
      "Upload error:",
      error
    );

    // --------------------------------------------------
    // Cleanup temporary file if anything failed
    // --------------------------------------------------

    try {
      if (
        temporaryFilePath &&
        fs.existsSync(temporaryFilePath)
      ) {
        fs.unlinkSync(
          temporaryFilePath
        );
      }
    } catch (cleanupError) {
      console.error(
        "Temporary file cleanup failed:",
        cleanupError
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}