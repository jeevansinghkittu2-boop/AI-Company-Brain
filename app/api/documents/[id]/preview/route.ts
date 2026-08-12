import { prisma } from "@/lib/prisma";
import fs from "fs";
import { NextResponse } from "next/server";
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

    const file = fs.readFileSync(document.filePath);

    // --------------------------------------------------
    // 8. Return preview
    // --------------------------------------------------

    return new NextResponse(file, {
      status: 200,

      headers: {
        "Content-Type":
          document.fileType ||
          "application/octet-stream",

        "Content-Length":
          file.length.toString(),

        "Content-Disposition":
          `inline; filename="${encodeURIComponent(
            document.name
          )}"`,
      },
    });
  } catch (error) {
    console.error("Preview error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Preview failed",
      },
      { status: 500 }
    );
  }
}