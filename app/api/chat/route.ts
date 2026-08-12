import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchDocuments } from "@/lib/search";

export async function POST(req: NextRequest) {
  try {
    // Check login
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { answer: "Please login first." },
        { status: 401 }
      );
    }

    // Get user's question
    const { question } = await req.json();

    // Find logged-in user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { answer: "User not found." },
        { status: 404 }
      );
    }

    // Get only this user's documents
    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
      },
      select: {
        extractedText: true,
      },
    });

    if (documents.length === 0) {
      return NextResponse.json({
        answer: "You haven't uploaded any documents yet.",
      });
    }

    // Extract text from all documents
    const texts = documents
      .map((doc) => doc.extractedText || "")
      .filter(Boolean);

    // Search documents
    const result = searchDocuments(question, texts);

    let answer = "";

    if (result.score === 0) {
      answer =
        "I couldn't find any information related to your question in your uploaded documents.";
    } else {
      answer = result.text;
    }

    return NextResponse.json({
      answer,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        answer: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}