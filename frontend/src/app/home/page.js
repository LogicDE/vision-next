"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/"); // Redirigir a login si no hay usuario
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-md bg-gray-50 relative">
        <div className="text-2xl font-bold text-gray-800">NEXOVITAL</div>
        <div className="hidden md:flex space-x-4">
          <Link href="/">
            <button className="block w-full text-center text-gray-700 hover:text-gray-900 font-medium">
              Sign off
            </button>
          </Link>
        </div>
      </header>

      {/* Tabs bar (debajo del header) */}
      <div className="tabs flex space-x-4 items-center px-6 py-4 shadow-md bg-gray-50">
        <button
          onClick={() => setActiveTab("groups")}
          className={`pb-2 font-medium ${
            activeTab === "groups"
              ? "border-b-2 border-cta text-cta"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Groups
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`pb-2 font-medium ${
            activeTab === "data"
              ? "border-b-2 border-cta text-cta"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Data
        </button>
        <button
          onClick={() => setActiveTab("update")}
          className={`pb-2 font-medium ${
            activeTab === "update"
              ? "border-b-2 border-cta text-cta"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Update Data
        </button>
      </div>

      <br></br>

      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl shadow-lg p-8 bg-gray-50">
          <div className="p-6">
            {/* Content */}
            <div>
              {/* My Groups */}
              {activeTab === "groups" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">My Groups</h2>
                    <button className="cta text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition">
                      + Create New Group
                    </button>
                  </div>
                  <hr className="p-4"></hr>
                  <p className="text-gray-600">
                    You don’t have any groups yet.
                  </p>
                </div>
              )}

              {/* My Data */}
              {activeTab === "data" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">My Data</h2>
                  <hr className="p-4"></hr>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      Dashboard Placeholder
                    </div>
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      Dashboard Placeholder
                    </div>
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      Dashboard Placeholder
                    </div>
                  </div>
                </div>
              )}

              {/* Update Data */}
              {activeTab === "update" && (
                <div>
                  <h2 className="text-2xl font-bold text-center mb-6">
                    Update Data
                  </h2>
                  <hr className="p-4"></hr>
                  <form className="space-y-4 max-w-md">
                    {/* Workload amount */}
                    <div>
                      <label className="block font-medium mb-1">
                        Workload amount (1 = little, 5 = excessive)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Stress levels */}
                    <div>
                      <label className="block font-medium mb-1">
                        Stress levels (1 = low, 5 = extremely high)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Emotional state */}
                    <div>
                      <label className="block font-medium mb-1">
                        Emotional state (1 = frustrated, 5 = with ease)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Additional comments */}
                    <div>
                      <label className="block font-medium mb-1">
                        Additional comments
                      </label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2"
                        rows="3"
                      ></textarea>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="cta text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
