import React, { useState, useEffect } from "react";

const RefinedByDropdowns = ({ onFiltersChange }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [filters, setFilters] = useState({
    rating: [],
    brands: [],
    priceRange: { min: "", max: "" },
    discount: [],
    item_type: [],
    manufacturer: [],
  });

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCheckboxChange = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] || [];
      const isChecked = currentValues.includes(value);

      const newValues = isChecked
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterType]: newValues,
      };
    });
  };

  const handlePriceChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value,
      },
    }));
  };

  // Notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      const apiFilters = {};

      // Convert rating to numeric values
      if (filters.rating.length > 0) {
        // For now, we'll skip rating filter as it's not implemented in backend
        // Could be added later with a rating field in the model
      }

      // Brands
      if (filters.brands.length > 0) {
        // For simplicity, take first brand (can be extended to multiple)
        apiFilters.manufacturer = filters.brands[0];
      }

      // Price range
      if (filters.priceRange.min) {
        apiFilters.min_price = parseFloat(filters.priceRange.min);
      }
      if (filters.priceRange.max) {
        apiFilters.max_price = parseFloat(filters.priceRange.max);
      }

      // Item type
      if (filters.item_type.length > 0) {
        apiFilters.item_type = filters.item_type[0];
      }

      onFiltersChange(apiFilters);
    }
  }, [filters, onFiltersChange]);

  const dropdownData = [
    {
      title: "Product Rating",
      content: (
        <div className="p-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.rating.includes("4")}
              onChange={() => handleCheckboxChange("rating", "4")}
            />
            <div className="flex space-x-1 text-green-600">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>☆</span>
            </div>
          </label>
          <label className="flex items-center space-x-2 mt-1">
            <input
              type="checkbox"
              checked={filters.rating.includes("3")}
              onChange={() => handleCheckboxChange("rating", "3")}
            />
            <div className="flex space-x-1 text-green-600">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>☆</span>
              <span>☆</span>
            </div>
          </label>
        </div>
      ),
    },
    {
      title: "Brands",
      content: (
        <div className="p-2">
          {["Freshco", "Hoovu Fresh", "shivani", "Samsung", "Local"].map(
            (brand) => (
              <label key={brand} className="block">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleCheckboxChange("brands", brand)}
                />{" "}
                {brand}
              </label>
            )
          )}
        </div>
      ),
    },
    {
      title: "Price",
      content: (
        <div className="p-2">
          <div className="mb-2">
            <label className="block text-sm text-gray-600">Min Price</label>
            <input
              type="number"
              className="w-full p-1 border border-gray-300 rounded"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm text-gray-600">Max Price</label>
            <input
              type="number"
              className="w-full p-1 border border-gray-300 rounded"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              placeholder="1000"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Item Type",
      content: (
        <div className="p-2">
          {[
            "Fruits",
            "Vegetables",
            "Dairy",
            "Bakery",
            "Beverages",
            "Snacks",
          ].map((type) => (
            <label key={type} className="block">
              <input
                type="checkbox"
                checked={filters.item_type.includes(type)}
                onChange={() => handleCheckboxChange("item_type", type)}
              />{" "}
              {type}
            </label>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {dropdownData.map((item, index) => (
        <div key={index} className="bg-gray-100 rounded">
          <button
            onClick={() => toggleDropdown(index)}
            className="w-full text-left font-semibold p-3 flex justify-between items-center"
          >
            {item.title}
            <span className="material-icons">
              {openIndex === index ? "↑" : "↓"}
            </span>
          </button>
          {openIndex === index && (
            <div className="border-t border-gray-300">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RefinedByDropdowns;
