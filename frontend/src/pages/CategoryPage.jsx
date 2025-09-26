import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCategoryById,
  fetchCategories,
} from "../app/slices/CategorySlice";
import Breadcrumb from "../components/Breadcrumb";
import CardGrid from "../features/CardGrid";
import RefinedByDropdowns from "../components/RefinedByDropdowns";
import { NavigationBar } from "../components/NavigationBar";

const CategoryPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { categories, selectedCategory, loading, error } = useSelector(
    (state) => state.categories
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Relevance");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("relevance");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(fetchCategoryById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories({ page: 1, pageSize: 50 }));
    }
  }, [categories.length, dispatch]);

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

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  if (loading) {
    return <div>Loading category...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedCategory) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="flex">
        {/* Sidebar */}
        {isSidebarVisible && (
          <aside className="w-80 bg-white p-4 border-r border-gray-200 hidden md:block">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Refine By</h2>
              <RefinedByDropdowns onFiltersChange={handleFiltersChange} />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-4">
            <Breadcrumb category={selectedCategory} />
            <h1 className="text-2xl font-bold mb-2">{selectedCategory.name}</h1>
            <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
          </div>

          {/* Display subcategories if any */}
          {selectedCategory.subcategories &&
            selectedCategory.subcategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCategory.subcategories.map((subcat) => (
                    <Link
                      key={subcat.id}
                      to={`/category/${subcat.id}`}
                      className="border p-4 rounded hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold">{subcat.name}</h3>
                      <p className="text-sm text-gray-600">
                        {subcat.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* Sort and Filter Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="md:hidden px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                {isSidebarVisible ? "Hide Filters" : "Show Filters"}
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center space-x-2"
                >
                  <span>Sort by: {selectedOption}</span>
                  <span className="material-icons text-sm">
                    {isDropdownOpen ? "arrow_drop_up" : "arrow_drop_down"}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {[
                      "Relevance",
                      "Price - Low to High",
                      "Price - High to Low",
                      "Rupee Saving - High to Low",
                      "Rupee Saving - Low to High",
                      "% Off - High to Low",
                    ].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <CardGrid
            categoryId={id}
            filters={filters}
            sortBy={sortBy}
            showItemBreadcrumbs={true}
            categories={categories}
          />
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;
