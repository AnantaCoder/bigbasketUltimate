import React from "react";
import CardGrid from "../features/CardGrid";

function HomePage() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r p-4 h-screen overflow-y-auto sticky top-0">
        <h3 className="text-lg font-semibold mb-4">Shop by Category</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="font-bold text-green-600">Beauty & Hygiene</li>
          <li>Bath & Hand Wash</li>
          <li>Feminine Hygiene</li>
          <li>Fragrances & Deos</li>
          <li>Hair Care</li>
          <li>Health & Medicine</li>
          <li>Skincare</li>
          <li>Oral Care</li>
          <li>Men’s Grooming</li>
          <li>Personal Care</li>
          <li>Ayurveda</li>
          <li>Wellness</li>
          <li className="text-blue-600 cursor-pointer">Show more +</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Beauty & Hygiene (14809)</h2>
          <button className="flex items-center gap-2 border px-4 py-2 rounded shadow-sm hover:bg-gray-100">
            Relevance
            <span className="material-icons">tune</span>
          </button>
        </div>

        {/* Product Grid */}
        <CardGrid />
      </main>
    </div>
  );
}

export default HomePage;
