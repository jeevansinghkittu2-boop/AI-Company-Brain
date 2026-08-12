import { prisma } from "@/lib/prisma";

interface ActivityData {
  action: string;
  target: string;
  userName: string;
  userEmail: string;
}

export async function logActivity({
  action,
  target,
  userName,
  userEmail,
}: ActivityData) {
  try {
    await prisma.activity.create({
      data: {
        action,
        target,
        userName,
        userEmail,
      },
    });
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
}