import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
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

    // Get current user
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

    // Get document ID
    const { documentId } = await req.json();

    const id = Number(documentId);

    if (!Number.isInteger(id)) {
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

    // IMPORTANT:
    // Verify that this document belongs to the logged-in user
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found or access denied",
        },
        {
          status: 404,
        }
      );
    }

    // Generate secure share ID
    const shareId = crypto
      .randomBytes(16)
      .toString("hex");

    // Update document
    const updatedDocument = await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        shareId,
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      shareUrl: `/share/${updatedDocument.shareId}`,
    });
  } catch (error) {
    console.error("Share error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate share link",
      },
      {
        status: 500,
      }
    );
  }
}