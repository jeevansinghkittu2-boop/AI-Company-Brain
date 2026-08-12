import { NextResponse } from "next/server";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    // --------------------------------------------------
    // 1. Check authentication
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
    // 2. Get logged-in user
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
    // 3. Get document ID
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
    // 5. Check file path
    // --------------------------------------------------

    if (!document.filePath) {
      return NextResponse.json(
        {
          success: false,
          message: "File path not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 6. Check physical file
    // --------------------------------------------------

    if (!fs.existsSync(document.filePath)) {
      return NextResponse.json(
        {
          success: false,
          message: "Uploaded file not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 7. Read file
    // --------------------------------------------------

    const fileBuffer = fs.readFileSync(document.filePath);

    // --------------------------------------------------
    // 8. Return file
    // --------------------------------------------------

    return new Response(fileBuffer, {
      status: 200,

      headers: {
        "Content-Type":
          document.fileType ||
          "application/octet-stream",

        "Content-Disposition":
          `attachment; filename="${encodeURIComponent(
            document.name
          )}"`,

        "Content-Length":
          fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Download failed",
      },
      { status: 500 }
    );
  }
}