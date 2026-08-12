"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    alert(data.message);
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-6">
        Register
      </h1>

      <input
        className="w-full border p-3 rounded mb-4 text-black"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full border p-3 rounded mb-4 text-black"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full border p-3 rounded mb-4 text-black"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={register}
        className="bg-blue-600 text-white w-full py-3 rounded"
      >
        Register
      </button>
    </div>
  );
}