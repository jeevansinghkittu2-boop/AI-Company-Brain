import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    shareId: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: Props
) {
  const { shareId } = await params;

  const document = await prisma.document.findUnique({
    where: {
      shareId,
    },
  });

  if (!document) {
    return NextResponse.json(
      {
        error: "Document not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(document);
}