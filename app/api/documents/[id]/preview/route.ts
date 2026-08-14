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
    // 2. Get user
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
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 5. Check Cloudinary URL
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
    // 6. Retrieve file from Cloudinary
    // --------------------------------------------------

    const response = await fetch(
      document.filePath
    );

    if (!response.ok) {
      console.error(
        "Cloudinary preview failed:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to retrieve file",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 7. Convert to buffer
    // --------------------------------------------------

    const fileBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    // --------------------------------------------------
    // 8. Return inline file
    // --------------------------------------------------

    return new Response(fileBuffer, {
      status: 200,

      headers: {
        "Content-Type":
          document.fileType ||
          "application/octet-stream",

        "Content-Length":
          fileBuffer.length.toString(),

        "Content-Disposition":
          `inline; filename="${encodeURIComponent(
            document.name
          )}"`,
      },
    });
  } catch (error) {
    console.error(
      "Preview error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Preview failed",
      },
      {
        status: 500,
      }
    );
  }
}