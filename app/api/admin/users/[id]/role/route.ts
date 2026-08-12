import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check logged-in user
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const role = body.role;

    if (role !== "USER" && role !== "ADMIN") {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // Prevent admin from removing their own admin role
    if (userId === currentUser.id && role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "You cannot remove your own admin role.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Role update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update role",
      },
      { status: 500 }
    );
  }
}