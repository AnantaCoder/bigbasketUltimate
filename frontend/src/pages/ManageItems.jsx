import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchItems,
  deleteItem,
  updateItem, // Make sure this is implemented in itemsSlice
  selectAllItems,
  selectItemsLoading,
} from "../app/slices/itemsSlice";
import { toast } from "react-toastify";

const ManageItems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectAllItems);
  const loading = useSelector(selectItemsLoading);

  const [infoItem, setInfoItem] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({});

  useEffect(() => {
    dispatch(fetchItems());

    const interval = setInterval(() => {
      dispatch(fetchItems());
    }, 120000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteItem(id))
        .unwrap()
        .then(() => {
          toast.success("Item deleted successfully");
        })
        .catch(() => {
          toast.error("Failed to delete item");
        });
    }
  };

  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setEditedItem({ ...item });
  };

  const handleSave = () => {
    dispatch(updateItem(editedItem))
      .unwrap()
      .then(() => {
        toast.success("Item updated successfully");
        setEditingItemId(null);
        setEditedItem({});
        dispatch(fetchItems());
      })
      .catch(() => toast.error("Failed to update item"));
  };

  const handleCancel = () => {
    setEditingItemId(null);
    setEditedItem({});
  };

  const handleInfo = (item) => {
    setInfoItem(item);
  };

  if (loading) {
    return <div>Loading items...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <span>📦</span> Manage Items
      </h1>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">Edit and manage your listed products</p>
        <button
          onClick={() => navigate("/seller/add-items")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-md p-4 mb-4 shadow-md flex flex-col md:flex-row md:justify-between"
          >
            <div className="flex-1">
              {editingItemId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editedItem.item_name || ""}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, item_name: e.target.value })
                    }
                    className="p-1 rounded bg-gray-700 text-white w-full"
                  />
                  <textarea
                    value={editedItem.description || ""}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, description: e.target.value })
                    }
                    className="p-1 rounded bg-gray-700 text-white mt-2 w-full"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{item.item_name}</h2>
                  <p className="text-gray-400">{item.item_type}</p>
                  <p className="text-sm mt-1">SKU: {item.sku}</p>
                  <p className="mt-2 text-gray-300">{item.description}</p>
                </>
              )}
            </div>

            <div className="flex flex-col justify-between ml-4 mt-4 md:mt-0">
              <p className="font-semibold">{item.manufacturer}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Category: {item.category ? item.category.name : "N/A"}</p>
              <p className="text-yellow-400 font-bold mt-2">₹ {item.price}</p>
            </div>

            <div className="flex items-center gap-2 ml-4 mt-4 md:mt-0">
              {editingItemId === item.id ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 p-2 rounded"
                    title="Save"
                  >
                    ✅
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 p-2 rounded"
                    title="Cancel"
                  >
                    ❌
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleInfo(item)}
                    className="bg-orange-600 hover:bg-orange-700 p-2 rounded"
                    title="Info"
                  >
                    ℹ️
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}

      {/* Info Modal */}
      {infoItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded shadow-lg w-96 relative">
            <button
              onClick={() => setInfoItem(null)}
              className="absolute top-2 right-2 text-white"
            >
              ❌
            </button>
            <h2 className="text-2xl font-bold mb-2">{infoItem.item_name}</h2>
            <p className="mb-1">Type: {infoItem.item_type}</p>
            <p className="mb-1">SKU: {infoItem.sku}</p>
            <p className="mb-1">Manufacturer: {infoItem.manufacturer}</p>
            <p className="mb-1">Quantity: {infoItem.quantity}</p>
            <p className="mb-1">Price: ₹{infoItem.price}</p>
            <p className="mb-1">Category: {infoItem.category?.name || "N/A"}</p>
            <p className="mt-3">{infoItem.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;
