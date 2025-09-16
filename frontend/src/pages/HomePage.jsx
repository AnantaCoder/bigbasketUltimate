import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CardGrid from "../features/CardGrid";
import RefinedByDropdowns from "../components/RefinedByDropdowns";
import { fetchCategories } from "../app/slices/CategorySlice";
import { NavigationBar } from "../components/NavigationBar";

function HomePage() {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Relevance");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("relevance");
  const [searchQuery, setSearchQuery] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Fetch categories on load
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchCategories({ page: 1, pageSize: 50 }));
    }
  }, [categories.length, categoriesLoading, dispatch]);

  // Sync category and search from query params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    setSelectedCategoryId(categoryParam ? parseInt(categoryParam, 10) : null);
    setSearchQuery(searchParam || null);
  }, [searchParams]);

  // Sorting option click
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
    let sortKey = "relevance";
    switch (option) {
      case "Price - Low to High":
        sortKey = "price_asc";
        break;
      case "Price - High to Low":
        sortKey = "price_desc";
        break;
      case "Rupee Saving - High to Low":
        sortKey = "saving_desc";
        break;
      case "Rupee Saving - Low to High":
        sortKey = "saving_asc";
        break;
      case "% Off - High to Low":
        sortKey = "percent_off_desc";
        break;
      default:
        sortKey = "relevance";
    }
    setSortBy(sortKey);
  };

  // Category click
  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    categoryId
      ? setSearchParams({ category: categoryId })
      : setSearchParams({});
  };

  const handleShowAll = () => {
    setSelectedCategoryId(null);
    setSearchParams({});
  };

  const toggleShowMore = () => {
    setShowAllCategories((prev) => !prev);
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <>
      <NavigationBar />

      <div className="p-4 text-2xl text-gray-400">
        <h1>
          Home /{" "}
          {searchQuery || 
                        categories.find((c) => c.id === selectedCategoryId)
                          ?.name || "Category"
                      } 
        </h1>
      </div>
      <div className="flex">
        {/* Premium Sidebar */}
        {isSidebarVisible && (
          <aside className="hidden md:block w-72 p-6 h-screen overflow-y-auto sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 shadow-lg sidebar-hidden">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Shop by Category
              </h3>
              <div className="border border-gray-300 rounded-lg p-4">
                <ul className="space-y-2 text-gray-700">
                  {categoriesLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <li key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </li>
                    ))
                  ) : (
                    <>
                      {categories.slice(0, 1).map((category) => (
                        <li
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className="cursor-pointer font-bold text-[#5E9400]"
                        >
                          {category.name}
                        </li>
                      ))}
                      <ul className="space-y-2 text-gray-700 pl-4 border-l border-gray-300">
                        {categories
                          .slice(1, showAllCategories ? categories.length : 5)
                          .map((category) => (
                            <li
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="cursor-pointer hover:text-gray-900"
                            >
                              {category.name}
                            </li>
                          ))}
                      </ul>
                    </>
                  )}
                </ul>

                {!categoriesLoading && categories.length > 5 && (
                  <button
                    onClick={toggleShowMore}
                    className="mt-4 text-[#5E9400] text-sm underline flex items-center"
                  >
                    <span>{showAllCategories ? "Show less -" : "Show more +"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Refined by Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 tracking-wide uppercase mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-[#5E9400]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Refined by
              </h3>
              <RefinedByDropdowns onFiltersChange={handleFiltersChange} />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-6 ${!isSidebarVisible ? "w-full" : ""}`}>
          {/* Sorting bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white text-gray-700 font-medium"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    !isSidebarVisible ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {isSidebarVisible ? "Hide Filters" : "Show Filters"}
              </button>
              <div>
                <h1 className="text-2xl font-light text-gray-800">
                  {selectedCategoryId
                    ? `Products in "${
                        categories.find((c) => c.id === selectedCategoryId)
                          ?.name || "Category"
                      }"`
                    : searchQuery
                    ? `Search results for "${searchQuery}"`
                    : "All Products"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Discover our premium collection
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white text-gray-700 font-medium"
              >
                <span>{selectedOption}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <ul className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-10 py-1">
                  {[
                    "Relevance",
                    "Price - Low to High",
                    "Price - High to Low",
                    "Rupee Saving - High to Low",
                    "Rupee Saving - Low to High",
                    "% Off - High to Low",
                  ].map((option) => (
                    <li
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-gray-700"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <CardGrid
            categoryId={selectedCategoryId}
            filters={filters}
            sortBy={sortBy}
            search={searchQuery}
          />
        </main>
      </div>
    </>
  );
}

export default HomePage;