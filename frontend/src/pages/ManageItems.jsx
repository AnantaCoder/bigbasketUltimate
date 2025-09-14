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
import { logoutUser } from "../app/slices/authSlice";
import { toast } from "react-toastify";
import Orders from "../seller/components/Orders";
import SellerProfileForm from "../seller/components/SellerProfileForm";

const ManageItems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeMenu, setActiveMenu] = useState("view-orders");

  const items = useSelector(selectAllItems) || [];
  const loading = useSelector(selectItemsLoading);

  const [infoItem, setInfoItem] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user?.id) return;

    if (activeMenu === "product-list") {
      dispatch(
        fetchSellerItems({
          sellerId: user.id,
          page: currentPage,
          pageSize: itemsPerPage,
        })
      )
        .unwrap()
        .then((res) => {
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
    } else if (activeMenu === "profile") {
      fetchSellerProfile();
    }
  }, [dispatch, currentPage, itemsPerPage, user?.id, activeMenu]);

  const fetchSellerProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await fetch('/api/auth/seller-profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSellerProfile(data);
      } else {
        toast.error("Failed to fetch seller profile");
      }
    } catch (error) {
      toast.error("Error fetching seller profile");
    }
    setProfileLoading(false);
  };

  const updateSellerProfile = async (updatedProfile) => {
    try {
      const response = await fetch('/api/auth/seller-profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      if (response.ok) {
        const data = await response.json();
        setSellerProfile(data);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageSizeChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (!user?.id) return toast.error("Missing seller information.");

    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteItem(id))
        .unwrap()
        .then(() => {
          toast.success("Item deleted successfully");
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

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === "add-new-products") {
      navigate("/seller/add-items");
    } else if (menu === "log-out") {
      dispatch(logoutUser());
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <p className="text-gray-700">You must be logged in.</p>
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

  const renderContent = () => {
    switch (activeMenu) {
      case "profile":
        return (
          <div className="p-8 bg-gray-50 min-h-screen text-gray-800 max-w-7xl mx-auto font-sans">
            <header className="mb-8 border-b pb-4 border-gray-200 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                  <span className="text-indigo-600">👤</span> Seller Profile
                </h1>
                <p className="text-gray-500 mt-1">
                  Edit your seller profile details.
                </p>
              </div>
            </header>

            {profileLoading ? (
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-600 text-lg">Loading profile...</p>
              </div>
            ) : sellerProfile ? (
              <SellerProfileForm profile={sellerProfile} onUpdate={updateSellerProfile} />
            ) : (
              <p className="text-gray-500">No profile data available.</p>
            )}
          </div>
        );
      case "view-orders":
        return <Orders />;
      case "product-list":
        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <p className="text-gray-600 text-lg">Loading items...</p>
            </div>
          );
        }
        return (
          <div className="p-8 bg-gray-50 min-h-screen text-gray-800 max-w-7xl mx-auto font-sans">
            <header className="mb-8 border-b pb-4 border-gray-200 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                  <span className="text-indigo-600">📦</span> Product List
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

            <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
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
      default:
        return <Orders />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <button
                onClick={() => handleMenuClick("profile")}
                className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors ${
                  activeMenu === "profile" ? "bg-indigo-100 text-indigo-700" : "text-gray-700"
                }`}
              >
                👤 Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick("product-list")}
                className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors ${
                  activeMenu === "product-list" ? "bg-indigo-100 text-indigo-700" : "text-gray-700"
                }`}
              >
                📦 Product List
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick("add-new-products")}
                className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors ${
                  activeMenu === "add-new-products" ? "bg-indigo-100 text-indigo-700" : "text-gray-700"
                }`}
              >
                ➕ Add New Products
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick("view-orders")}
                className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors ${
                  activeMenu === "view-orders" ? "bg-indigo-100 text-indigo-700" : "text-gray-700"
                }`}
              >
                📋 View Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick("log-out")}
                className="w-full text-left px-6 py-3 hover:bg-red-100 text-red-700 transition-colors"
              >
                🚪 Log Out
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManageItems;
