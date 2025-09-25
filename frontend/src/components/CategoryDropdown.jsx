import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../app/slices/CategorySlice";
import { useNavigate } from "react-router-dom";

const CategoryDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector(
    (state) => state.categories
  );

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeSubCategoryIndex, setActiveSubCategoryIndex] = useState(0);

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      dispatch(fetchCategories({ page: 1, pageSize: 50 }));
    }
  }, [categories.length, loading, dispatch]);

  if (loading) {
    return (
      <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg p-4 z-50">
        Loading categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg p-4 z-50 text-red-600">
        Failed to load categories.
      </div>
    );
  }

  if (!categories.length) {
    return null;
  }

  const activeCategory = categories[activeCategoryIndex];
  const subcategories = activeCategory?.subcategories || [];
  const activeSubCategory = subcategories[activeSubCategoryIndex] || null;

  const handleSelect = (id) => {
    navigate(`/home?category=${id}`);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-full max-w-6xl bg-white shadow-lg rounded-lg flex z-50 border border-gray-200">
      {/* Left column: main categories */}
      <div className="w-1/3 bg-gray-900 text-white rounded-l-lg overflow-y-auto max-h-96">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              index === activeCategoryIndex ? "bg-gray-700 font-bold" : ""
            }`}
            onMouseEnter={() => {
              setActiveCategoryIndex(index);
              setActiveSubCategoryIndex(0); // reset subcategory when switching main
            }}
            onClick={() => handleSelect(cat.id)}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* Middle column: subcategories */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto max-h-96">
        {subcategories.length > 0 ? (
          subcategories.map((subcat, index) => (
            <div
              key={subcat.id}
              className={`mb-3 cursor-pointer hover:text-emerald-600 ${
                index === activeSubCategoryIndex ? "font-bold text-emerald-700" : ""
              }`}
              onMouseEnter={() => setActiveSubCategoryIndex(index)}
              onClick={() => handleSelect(subcat.id)}
            >
              {subcat.name}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No subcategories</p>
        )}
      </div>

      {/* Right column: sub-subcategories */}
      <div className="w-1/3 bg-gray-50 p-4 overflow-y-auto max-h-96 rounded-r-lg">
        {activeSubCategory?.subcategories &&
        activeSubCategory.subcategories.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700">
            {activeSubCategory.subcategories.map((subsubcat) => (
              <li
                key={subsubcat.id}
                className="mb-2 cursor-pointer hover:text-emerald-600"
                onClick={() => handleSelect(subsubcat.id)}
              >
                {subsubcat.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No sub-subcategories</p>
        )}
      </div>
    </div>
  );
};

export default CategoryDropdown;
