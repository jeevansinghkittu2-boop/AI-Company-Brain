import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    const document = await prisma.document.findUnique({
      where: {
        id,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          message: "Document not found",
        },
        {
          status: 404,
        }
      );
    }

    const updated = await prisma.document.update({
      where: {
        id,
      },
      data: {
        favorite: !document.favorite,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}