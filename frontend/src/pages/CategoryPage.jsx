import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategoryById, fetchItemsByCategory } from "../app/slices/CategorySlice";
import Breadcrumb from "../components/Breadcrumb";
import Card from "../components/Card";

const CategoryPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedCategory, categoryItems, loading, error } = useSelector(
    (state) => state.categories
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchCategoryById(id));
      dispatch(fetchItemsByCategory(id));
    }
  }, [id, dispatch]);

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
    <div className="container mx-auto p-4">
      <Breadcrumb category={selectedCategory} />
      <h1 className="text-2xl font-bold mb-4">{selectedCategory.name}</h1>
      <p className="text-gray-600 mb-4">{selectedCategory.description}</p>

      {/* Display subcategories if any */}
      {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedCategory.subcategories.map((subcat) => (
              <div key={subcat.id} className="border p-4 rounded">
                <h3 className="font-semibold">{subcat.name}</h3>
                <p className="text-sm text-gray-600">{subcat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Items in this category</h2>
        {categoryItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryItems.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p>No items found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
