import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSellerItems,
  deleteItem,
  updateItem,
  selectAllItems,
  selectItemsLoading,
} from "../app/slices/itemsSlice";
import { toast } from "react-toastify";

const ManageItems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const items = useSelector(selectAllItems) || [];
  const loading = useSelector(selectItemsLoading);

  const [infoItem, setInfoItem] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user?.id) return;

    dispatch(
      fetchSellerItems({
        sellerId: user.id,
        page: currentPage,
        pageSize: itemsPerPage,
      })
    )
      .unwrap()
      .then((res) => {
        // backend might return count or total_pages - handle both
        if (res && res.total_pages) {
          setTotalPages(res.total_pages);
        } else if (res && res.count) {
          setTotalPages(Math.ceil(res.count / itemsPerPage));
        } else {
          
          setTotalPages((prev) => Math.max(1, prev));
        }
      })
      .catch(() => {
        toast.error("Failed to fetch seller items");
      });

    // refresh periodically (every 2 minutes)
    const interval = setInterval(() => {
      dispatch(fetchSellerItems({ sellerId: user.id, page: currentPage }));
    }, 120000);

    return () => clearInterval(interval);
  }, [dispatch, currentPage, itemsPerPage, user?.id]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageSizeChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page when size changes
  };

  const handleDelete = (id) => {
    if (!user?.id) return toast.error("Missing seller information.");

    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteItem(id))
        .unwrap()
        .then(() => {
          toast.success("Item deleted successfully");
          // refetch seller items
          dispatch(fetchSellerItems({ sellerId: user.id, page: currentPage }));
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
    if (!editedItem?.id) return toast.error("No item to update");

    dispatch(updateItem(editedItem))
      .unwrap()
      .then(() => {
        toast.success("Item updated successfully");
        setEditingItemId(null);
        setEditedItem({});
        // refetch seller items
        if (user?.id)
          dispatch(fetchSellerItems({ sellerId: user.id, page: currentPage }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({ ...editedItem, [name]: value });
  };

  // If user is not seller, show a friendly message and don't attempt fetches
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <p className="text-gray-700">
            You must be logged in to manage items.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user.is_seller) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <p className="text-gray-700">You are not registered as a seller.</p>
          <button
            onClick={() => navigate("/seller/register")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Register as Seller
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <header className="mb-8 border-b pb-4 border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="text-indigo-600">📦</span> Manage Items
          </h1>
          <p className="text-gray-500 mt-1">
            Easily view, edit, and delete your listed products.
          </p>
        </div>
        <button
          onClick={() => navigate("/seller/add-items")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          ➕ Add New Item
        </button>
      </header>

      {/* Items List */}
      <main>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No items found. Start by adding a new item.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <img
                      src={item.image_urls[0]}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "No Image"
                  )}
                </div>

                <div className="p-6">
                  {editingItemId === item.id ? (
                    <>
                      <input
                        type="text"
                        name="item_name"
                        value={editedItem.item_name || ""}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full mb-2 text-gray-900"
                      />
                      <textarea
                        name="description"
                        value={editedItem.description || ""}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full text-gray-900"
                        rows="3"
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {item.item_name}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {item.manufacturer}
                      </p>
                      <p className="text-gray-600 mt-3 line-clamp-2">
                        {item.description}
                      </p>
                    </>
                  )}

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium">Price:</span>
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          name="price"
                          value={editedItem.price || ""}
                          onChange={handleChange}
                          className="p-1 border border-gray-300 rounded-md w-24 text-right text-green-600 font-bold"
                        />
                      ) : (
                        <span className="text-lg font-bold text-green-600">
                          ₹ {item.price}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium">
                        Quantity:
                      </span>
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editedItem.quantity || ""}
                          onChange={handleChange}
                          className="p-1 border border-gray-300 rounded-md w-24 text-right"
                        />
                      ) : (
                        <span className="text-gray-900">{item.quantity}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Category:
                      </span>
                      <span className="text-gray-900">
                        {item.category?.name || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 mt-6">
                    {editingItemId === item.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
                          title="Save"
                        >
                          <span className="w-5 h-5 block">✅</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-400 hover:bg-gray-500 text-white p-3 rounded-full transition-colors"
                          title="Cancel"
                        >
                          <span className="w-5 h-5 block">❌</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleInfo(item)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-full transition-colors"
                          title="Info"
                        >
                          <span className="w-5 h-5 block">ℹ️</span>
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full transition-colors"
                          title="Edit"
                        >
                          <span className="w-5 h-5 block">✏️</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
                          title="Delete"
                        >
                          <span className="w-5 h-5 block">🗑️</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Pagination + Page Size */}
      <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={handlePageSizeChange}
            className="border border-gray-300 rounded-md px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            ⬅ Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      </footer>

      {/* Info Modal */}
      {infoItem && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all scale-100 ease-out">
            <button
              onClick={() => setInfoItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              ❌
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {infoItem.item_name}
            </h2>
            <p className="text-gray-500 mb-4">{infoItem.item_type}</p>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold">SKU:</span> {infoItem.sku}
              </p>
              <p>
                <span className="font-semibold">Manufacturer:</span>{" "}
                {infoItem.manufacturer}
              </p>
              <p>
                <span className="font-semibold">Quantity:</span>{" "}
                {infoItem.quantity}
              </p>
              <p>
                <span className="font-semibold">Price:</span> ₹{infoItem.price}
              </p>
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {infoItem.category?.name || "N/A"}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-600">{infoItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;
