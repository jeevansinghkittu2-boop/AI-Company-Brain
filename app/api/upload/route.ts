import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { extractText } from "@/lib/extractors/extractText";
import { summarizeText, analyzeSentiment } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File;

    const tags = formData.get("tags")?.toString() || "";

    if (!file) {
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, file.name);

    fs.writeFileSync(filePath, buffer);

    let extractedText = "";

    try {
      extractedText = await extractText(filePath);
      console.log("Text extracted successfully.");
    } catch (error) {
      console.log("Extraction skipped:", error);
    }

    const summary = await summarizeText(extractedText);
    const sentiment = await analyzeSentiment(extractedText);

    let category = "General";

    if (file.type.includes("pdf")) {
      category = "PDF Document";
    } else if (
      file.type.includes("word") ||
      file.name.endsWith(".docx")
    ) {
      category = "Word Document";
    } else if (file.type.includes("text")) {
      category = "Text File";
    } else if (
      file.type.includes("csv") ||
      file.name.endsWith(".csv")
    ) {
      category = "Dataset";
    } else if (
      file.type.includes("zip") ||
      file.name.endsWith(".zip")
    ) {
      category = "Archive";
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    await prisma.document.create({
      data: {
        name: file.name,
        fileType: file.type,
        filePath,
        fileSize: file.size,
        extractedText,
        summary,
        sentiment,
        category,
        userId: user.id,

        tags: {
          connectOrCreate: tagList.map((tag) => ({
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

    await logActivity({
      action: "Uploaded Document",
      target: file.name,
      userName: user.name ?? "Unknown User",
      userEmail: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully!",
      filename: file.name,
    });
  } catch (error) {
    console.error(error);

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