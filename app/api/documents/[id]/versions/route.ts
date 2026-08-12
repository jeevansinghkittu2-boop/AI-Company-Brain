import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // 2. Document ID
    // --------------------------------------------------

    const { id } = await context.params;

    const documentId = Number(id);

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        {
          message: "Invalid document ID.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 3. Get user
    // --------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
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
          message:
            "Document not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 5. Get versions
    // --------------------------------------------------

    const versions =
      await prisma.documentVersion.findMany({
        where: {
          documentId: document.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          documentId: true,
          name: true,
          fileType: true,
          filePath: true,
          fileSize: true,
          extractedText: true,
          summary: true,
          sentiment: true,
          category: true,
          createdAt: true,
        },
      });

    // --------------------------------------------------
    // 6. Return versions
    // --------------------------------------------------

    return NextResponse.json(versions);
  } catch (error) {
    console.error(
      "Version history error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load version history.",
      },
      {
        status: 500,
      }
    );
  }
}