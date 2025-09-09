import React, { useState } from "react";
import CardGrid from "../features/CardGrid";
import RefinedByDropdowns from "../components/RefinedByDropdowns";
import { NavigationBar } from "../components/NavigationBar";

function HomePage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Relevance");

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
    console.log(`Selected sorting option: ${option}`);
    // Here you can add logic to handle the sorting/filtering
  };

  return (

    <>
    <NavigationBar/>
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 p-4 h-screen overflow-y-auto sticky top-0 bg-white border rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Shop by Category</h3>
        <ul className="space-y-2 text-gray-700 border-l border-gray-300 pl-4">
          <li className="font-bold text-green-600">Fruits & Vegetables</li>
          <li>Cuts & Sprouts</li>
          <li>Exotic Fruits & Veggies</li>
          <li>Flower Bouquets, Bunches</li>
          <li>Fresh Fruits</li>
          <li>Fresh Vegetables</li>
          <li className="text-blue-600 cursor-pointer underline">Show more +</li>
        </ul>

        {/* Refined by Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Refined by</h3>
          <RefinedByDropdowns />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Top bar */}
        <div className="flex items-center justify-end mb-6">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border px-4 py-2 rounded shadow-sm hover:bg-gray-100"
            >
              Relevance
              {/* Removed the expand_more icon as requested */}
            </button>
            {isDropdownOpen && (
              <ul className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                <li
                  onClick={() => handleOptionClick("Price - Low to High")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Price - Low to High
                </li>
                <li
                  onClick={() => handleOptionClick("Price - High to Low")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Price - High to Low
                </li>
                <li
                  onClick={() => handleOptionClick("Rupee Saving - High to Low")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Rupee Saving - High to Low
                </li>
                <li
                  onClick={() => handleOptionClick("Rupee Saving - Low to High")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Rupee Saving - Low to High
                </li>
                <li
                  onClick={() => handleOptionClick("% Off - High to Low")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  % Off - High to Low
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <CardGrid />
      </main>
    </div>
    </>

  );
}

export default HomePage;
