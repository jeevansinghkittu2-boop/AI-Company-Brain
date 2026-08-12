"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-6">
        Login
      </h1>

      <input
        className="w-full border p-3 rounded mb-4 text-black"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full border p-3 rounded mb-6 text-black"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
      >
        Login
      </button>
    </div>
  );
}