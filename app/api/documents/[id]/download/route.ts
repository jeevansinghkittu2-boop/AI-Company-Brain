import { NextResponse } from "next/server";
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
        {
          status: 404,
        }
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
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 4. Verify ownership
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
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 5. Check file URL
    // --------------------------------------------------

    if (!document.filePath) {
      return NextResponse.json(
        {
          success: false,
          message: "File URL not found",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 6. Cloudinary file
    // --------------------------------------------------

    if (
      document.filePath.includes(
        "res.cloudinary.com"
      )
    ) {
      /*
       * Instead of fetching the Cloudinary file
       * through the Next.js server, redirect the
       * browser directly to Cloudinary.
       *
       * This avoids server-side Cloudinary retrieval
       * problems and works with the same URL used
       * by Preview.
       */

      const cloudinaryUrl = document.filePath;

const downloadUrl = cloudinaryUrl.replace(
  "/image/upload/",
  "/image/upload/fl_attachment/"
);

return NextResponse.redirect(downloadUrl);
    }

    // --------------------------------------------------
    // 7. Legacy/local file fallback
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: false,
        message:
          "This document is stored using an old file format. Please replace the document to migrate it to Cloudinary.",
      },
      {
        status: 410,
      }
    );
  } catch (error) {
    console.error(
      "Download error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Download failed",
      },
      {
        status: 500,
      }
    );
  }
}