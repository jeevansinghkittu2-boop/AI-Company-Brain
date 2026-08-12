"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    documents: number;
    folders: number;
  };
}

interface AdminUsersProps {
  users: User[];
}

export default function AdminUsers({
  users,
}: AdminUsersProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);

  async function deleteUser(userId: number, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}? This will also delete their documents and folders.`
    );

    if (!confirmed) return;

    try {
      setDeleting(userId);

      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete user"
        );
      }

      alert("User deleted successfully!");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete user"
      );
    } finally {
      setDeleting(null);
    }
  }

  async function changeRole(
    userId: number,
    newRole: string
  ) {
    try {
      setUpdatingRole(userId);

      const response = await fetch(
        `/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update role"
        );
      }

      alert("User role updated successfully!");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update role"
      );
    } finally {
      setUpdatingRole(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (user.name || "")
        .toLowerCase()
        .includes(searchText) ||
      user.email
        .toLowerCase()
        .includes(searchText);

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        User Management
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border rounded-lg px-4 py-3 flex-1"
        />

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          className="border rounded-lg px-4 py-3"
        >
          <option value="ALL">
            All Roles
          </option>

          <option value="USER">
            Users
          </option>

          <option value="ADMIN">
            Admins
          </option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-gray-500">
          No users found.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">
                    Name
                  </th>

                  <th className="text-left p-4">
                    Email
                  </th>

                  <th className="text-left p-4">
                    Documents
                  </th>

                  <th className="text-left p-4">
                    Folders
                  </th>

                  <th className="text-left p-4">
                    Created
                  </th>

                  <th className="text-left p-4">
                    Role
                  </th>

                  <th className="text-left p-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t"
                  >
                    <td className="p-4 font-medium">
                      {user.name ||
                        "Unnamed User"}
                    </td>

                    <td className="p-4 text-gray-600">
                      {user.email}
                    </td>

                    <td className="p-4">
                      {user._count.documents}
                    </td>

                    <td className="p-4">
                      {user._count.folders}
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(
                        user.createdAt
                      )
                        .toISOString()
                        .split("T")[0]}
                    </td>

                    <td className="p-4">
                      <select
                        value={user.role}
                        disabled={
                          updatingRole === user.id
                        }
                        onChange={(e) =>
                          changeRole(
                            user.id,
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                      >
                        <option value="USER">
                          USER
                        </option>

                        <option value="ADMIN">
                          ADMIN
                        </option>
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() =>
                          deleteUser(
                            user.id,
                            user.name ||
                              "this user"
                          )
                        }
                        disabled={
                          deleting === user.id
                        }
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === user.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}