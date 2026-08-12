import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json([]);
  }

  const documents = await prisma.document.findMany({
    where: {
      extractedText: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  return NextResponse.json(documents);
}