import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
} from "../app/slices/itemsSlice";
import Card from "../components/Card";

const CardGrid = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectAllItems);
  const loading = useSelector(selectItemsLoading);
  const error = useSelector(selectItemsError);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!items || !items.length) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
        <img
          src="./no.png"
          alt="No items found"
          className="max-w-md w-full object-contain mb-6"
        />
        <p className="text-gray-500 text-lg md:text-xl font-medium">
          No items found.
        </p>
        {/* Button when no items */}
        <button
          onClick={() => dispatch(fetchItems())}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Reload Items
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Items</h2>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">{items.length} items</div>
          {/* Header button */}
          <button
            onClick={() => dispatch(fetchItems())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default CardGrid;
