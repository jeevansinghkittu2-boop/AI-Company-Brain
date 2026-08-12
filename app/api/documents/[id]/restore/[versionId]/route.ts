import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

interface RouteContext {
  params: Promise<{
    id: string;
    versionId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ------------------------------------------------
    // 1. Authentication
    // ------------------------------------------------

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

    // ------------------------------------------------
    // 2. Get IDs
    // ------------------------------------------------

    const { id, versionId } = await context.params;

    const documentId = Number(id);
    const versionIdNumber = Number(versionId);

    if (
      !Number.isInteger(documentId) ||
      !Number.isInteger(versionIdNumber)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document or version ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 3. Get current user
    // ------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // 4. Verify document ownership
    // ------------------------------------------------

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
          message: "Document not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // 5. Find requested version
    // ------------------------------------------------

    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionIdNumber,
        documentId: document.id,
      },
    });

    if (!version) {
      return NextResponse.json(
        {
          success: false,
          message: "Version not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // 6. Validate required version fields
    // ------------------------------------------------
    // Document requires:
    // name
    // fileType
    // filePath
    //
    // Older versions may have NULL values because they
    // were created before these fields were added.

    if (
      !version.name ||
      !version.fileType ||
      !version.filePath
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This version cannot be restored because file information is missing.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 7. Save current document as a new version
    // ------------------------------------------------

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

    // ------------------------------------------------
    // 8. Restore selected version
    // ------------------------------------------------

    await prisma.document.update({
      where: {
        id: document.id,
      },

      data: {
        name: version.name,

        fileType: version.fileType,

        filePath: version.filePath,

        fileSize: version.fileSize,

        extractedText:
          version.extractedText || "",

        summary: version.summary,

        sentiment: version.sentiment,

        category: version.category,
      },
    });

    // ------------------------------------------------
    // 9. Activity log
    // ------------------------------------------------

    await logActivity({
      action: "Restored Document Version",

      target: version.name,

      userName:
        user.name || "Unknown User",

      userEmail: user.email,
    });

    // ------------------------------------------------
    // 10. Success
    // ------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Version restored successfully.",
    });
  } catch (error) {
    console.error(
      "Restore version error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to restore version.",
      },
      {
        status: 500,
      }
    );
  }
}