import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../app/slices/CategorySlice";
import { useNavigate } from "react-router-dom";

const CategoryDropdown = ({ onCategorySelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector(
    (state) => state.categories
  );
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

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

  // Assuming categories have a structure like:
  // { id, name, subcategories: [{ id, name, subcategories: [...] }] }
  // For simplicity, we show only two levels here.

  const activeCategory = categories[activeCategoryIndex];

  const handleSelect = (id) => {
    navigate(`/category/${id}`);
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-full max-w-4xl bg-white shadow-lg rounded-lg flex z-50 border border-gray-200">
      {/* Left column: main categories */}
      <div className="w-1/2 bg-gray-900 text-white rounded-l-lg overflow-y-auto max-h-96">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              index === activeCategoryIndex ? "bg-gray-700 font-bold" : ""
            }`}
            onMouseEnter={() => setActiveCategoryIndex(index)}
            onClick={() => handleSelect(cat.id)}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {console.log("active categories ",activeCategory )}

      {/* Right column: subcategories */}
      <div className="w-1/2 bg-gray-100 p-4 overflow-y-auto max-h-96 rounded-r-lg">
        {activeCategory.subcategories &&
        activeCategory.subcategories.length > 0 ? (
          activeCategory.subcategories.map((subcat) => (
            <div key={subcat.id} className="mb-3">
              <h3
                className="font-semibold mb-2 cursor-pointer hover:text-emerald-600"
                onClick={() => handleSelect(subcat.id)}
              >
                {subcat.name}
              </h3>
              {subcat.subcategories && subcat.subcategories.length > 0 && (
                <ul className="list-disc list-inside text-gray-700">
                  {subcat.subcategories.map((subsubcat) => (
                    <li
                      key={subsubcat.id}
                      className="mb-1 cursor-pointer hover:text-emerald-600"
                      onClick={() => handleSelect(subsubcat.id)}
                    >
                      {subsubcat.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No subcategories</p>
        )}
      </div>
    </div>
  );
};

export default CategoryDropdown;
