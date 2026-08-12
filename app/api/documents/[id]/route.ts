import { NextResponse } from "next/server";
import fs from "fs";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
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

    // 2. Find logged-in user
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // 3. Get document ID
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

    // 4. IMPORTANT: Verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: currentUser.id,
      },
    });

    // This prevents User B from deleting User A's document
    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found or access denied",
        },
        { status: 404 }
      );
    }

    // 5. Delete physical file
    if (
      document.filePath &&
      fs.existsSync(document.filePath)
    ) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (fileError) {
        console.error(
          "Failed to delete physical file:",
          fileError
        );
      }
    }

    // 6. Delete database record
    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    // 7. Log activity
    await logActivity({
      action: "Deleted Document",
      target: document.name,
      userName: currentUser.name ?? "Unknown User",
      userEmail: currentUser.email,
    });

    // 8. Success
    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed",
      },
      { status: 500 }
    );
  }
}