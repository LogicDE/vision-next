"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // para redirección en Next 13+

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Validar según data.success, no res.ok
      if (!data.success) {
        throw new Error(data.message || "Credenciales incorrectas");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cta text-white rounded-lg py-2 font-medium hover:opacity-90 transition"
          >
            Log-in
          </button>
        </form>
      </div>
    </div>
  );
}
