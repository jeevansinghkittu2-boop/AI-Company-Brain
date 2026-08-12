import { prisma } from "@/lib/prisma";
import AdminUsers from "@/components/AdminUsers";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          documents: true,
          folders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

 const formattedUsers = users.map((user) => ({
  id: user.id,
  name: user.name || "Unnamed User",
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  _count: user._count,
}));
  return <AdminUsers users={formattedUsers} />;
}