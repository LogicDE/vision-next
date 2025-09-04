"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-md bg-gray-50 relative">
        <div className="text-2xl font-bold text-gray-800">NEXOVITAL</div>

        {/* Botones escritorio */}
        <div className="hidden md:flex space-x-4">
          <Link href="/">
            <button className="block w-full text-center text-gray-700 hover:text-gray-900 font-medium">Sign in</button>
          </Link>
          <Link href="/register">
            <button className="cta text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition">
              Request Access
            </button>
          </Link>
        </div>

        {/* Botón hamburguesa móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  menuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-gray-50 shadow-md px-6 py-4 space-y-2">
        <Link href="/">
          <button className="block w-full text-center text-gray-700 hover:text-gray-900 font-medium">
            Sign in
          </button>
        </Link>
        <Link href="/register">
          <button className="block w-full cta text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition">
            Request Access
          </button>
        </Link>
      </div>
      )}

      {/* Login Form */}
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl shadow-lg p-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>
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

            <Link href="/home">
              <button
                /*type="submit"*/
                className="w-full cta text-white rounded-lg py-2 font-medium hover:opacity-90 transition"
              >
              Log-in
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
