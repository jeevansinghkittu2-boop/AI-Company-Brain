import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        darkMode: true,
        documentNotifications: true,
        activityNotifications: true,
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

    return NextResponse.json({
      success: true,
      settings: user,
    });
  } catch (error) {
    console.error("Settings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();

    const updateData: {
      name?: string;
      darkMode?: boolean;
      documentNotifications?: boolean;
      activityNotifications?: boolean;
    } = {};

    // ----------------------------------------------
    // Name
    // ----------------------------------------------

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (name.length < 2) {
        return NextResponse.json(
          {
            success: false,
            message: "Name must contain at least 2 characters.",
          },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Name is too long.",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    // ----------------------------------------------
    // Dark mode
    // ----------------------------------------------

    if (typeof body.darkMode === "boolean") {
      updateData.darkMode = body.darkMode;
    }

    // ----------------------------------------------
    // Document notifications
    // ----------------------------------------------

    if (
      typeof body.documentNotifications === "boolean"
    ) {
      updateData.documentNotifications =
        body.documentNotifications;
    }

    // ----------------------------------------------
    // Activity notifications
    // ----------------------------------------------

    if (
      typeof body.activityNotifications === "boolean"
    ) {
      updateData.activityNotifications =
        body.activityNotifications;
    }

    // ----------------------------------------------
    // Validate request
    // ----------------------------------------------

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid settings provided.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // Update user
    // ----------------------------------------------

    const updatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: updateData,

        select: {
          id: true,
          name: true,
          email: true,
          darkMode: true,
          documentNotifications: true,
          activityNotifications: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      settings: updatedUser,
    });
  } catch (error) {
    console.error("Settings PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings.",
      },
      { status: 500 }
    );
  }
}