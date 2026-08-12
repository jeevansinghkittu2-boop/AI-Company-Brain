import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
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
      { error: "User not found" },
      { status: 404 }
    );
  }

  const { documentId, folderId } = await req.json();

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
  });

  if (!document || document.userId !== user.id) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  await prisma.document.update({
    where: {
      id: documentId,
    },
    data: {
      folderId: folderId || null,
    },
  });

  return NextResponse.json({
    success: true,
  });
}