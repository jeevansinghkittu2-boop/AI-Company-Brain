import { prisma } from "@/lib/prisma";
import fs from "fs";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!document) {
      return new NextResponse("Document not found", {
        status: 404,
      });
    }

    const file = fs.readFileSync(document.filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": document.fileType,
        "Content-Disposition": `attachment; filename="${document.name}"`,
      },
    });
  } catch (error) {
    console.error(error);

    return new NextResponse("Download failed", {
      status: 500,
    });
  }
}