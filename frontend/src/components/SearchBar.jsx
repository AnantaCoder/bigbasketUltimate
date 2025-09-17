// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  selectCart,
} from "../app/slices/CartSlice"; // adjust path if needed

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState({});
  const searchTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const wrapperRef = useRef(null); // for click outside detection

  // Close modal if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSearchModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    setSearchQuery(searchParam);
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchModal(false);
    }
  };

  const fetchSearchItems = async (q) => {
    try {
      const res = await axios.get(
        `/api/store/new-items/?search=${encodeURIComponent(q)}`
      );
      if (!isMountedRef.current) return;
      setSearchItems(res.data.results || []);
      setShowSearchModal(true);
    } catch (err) {
      console.error("Error fetching search items:", err);
      if (!isMountedRef.current) return;
      setSearchItems([]);
      setShowSearchModal(true);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.length > 2) {
      searchTimeoutRef.current = setTimeout(() => fetchSearchItems(query), 200);
    } else {
      setSearchItems([]);
      setShowSearchModal(false);
    }
  };

  const getItemQuantityFromCart = (itemId) => {
    if (!cart || !cart.items) return 0;
    const found = cart.items.find((it) => it.id === itemId);
    return found ? Number(found.quantity) : 0;
  };

  const setItemLoading = (itemId, val) =>
    setLoadingItems((s) => ({ ...s, [itemId]: val }));

  const handleAddToCart = async (item) => {
    setItemLoading(item.id, true);
    try {
      await dispatch(addItemToCart(item.id)).unwrap();
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setItemLoading(item.id, false);
    }
  };

  const handleIncrease = async (item) => {
    const currentQty = getItemQuantityFromCart(item.id);
    const newQty = currentQty + 1;
    setItemLoading(item.id, true);
    try {
      await dispatch(
        updateItemQuantity({ itemId: item.id, quantity: newQty })
      ).unwrap();
    } catch (err) {
      console.error("Increase quantity failed", err);
    } finally {
      setItemLoading(item.id, false);
    }
  };

  const handleDecrease = async (item) => {
    const currentQty = getItemQuantityFromCart(item.id);
    const newQty = currentQty - 1;
    setItemLoading(item.id, true);
    try {
      if (newQty <= 0) {
        await dispatch(removeItemFromCart(item.id)).unwrap();
      } else {
        await dispatch(
          updateItemQuantity({ itemId: item.id, quantity: newQty })
        ).unwrap();
      }
    } catch (err) {
      console.error("Decrease quantity failed", err);
    } finally {
      setItemLoading(item.id, false);
    }
  };

  const handleSearchItemClick = (item) => {
    setShowSearchModal(false);
    navigate(`/product/${item.id}`, { state: { item } });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-grow max-w-3xl mx-8 relative"
      role="search"
      aria-label="Product search"
      ref={wrapperRef} // attach ref
    >
      <div className="relative w-full group">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Search for Products..."
          className="w-full border-2 border-gray-200 rounded-xl py-3 pl-5 pr-14 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-sm group-hover:shadow-md"
          autoComplete="off"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center justify-center px-4 bg-gradient-to-r from-[#5E9400] to-[#5E9400] hover:from-[#5E9400] hover:to-[#5E9400] rounded-r-xl transition-all duration-300 shadow-md hover:shadow-lg"
          aria-label="Search"
        >
          <SearchIcon />
        </button>

        {showSearchModal && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchItems.length > 0 ? (
              <ul>
                {searchItems.map((item) => {
                  const qty = getItemQuantityFromCart(item.id);
                  const isLoading = !!loadingItems[item.id];

                  return (
                    <li
                      key={item.id}
                      className="cursor-pointer px-4 py-2 hover:bg-emerald-100 flex items-center gap-3 justify-between"
                    >
                      <div
                        className="flex items-center gap-3 flex-1"
                        onClick={() => handleSearchItemClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearchItemClick(item);
                        }}
                      >
                        <img
                          src={item.image_urls || "/placeholder-image.png"}
                          alt={item.item_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="text-sm">
                          <div className="font-medium">{item.item_name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add / Quantity Controls */}
                      <div className="ml-4 flex items-center gap-2">
                        {qty <= 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            disabled={isLoading}
                            className="bg-[#5E9400] hover:opacity-90 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            {isLoading ? "Adding..." : "Add"}
                          </button>
                        ) : (
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleDecrease(item)}
                              disabled={isLoading}
                              className="px-3 py-1 text-sm disabled:opacity-60"
                              aria-label={`Decrease quantity of ${item.item_name}`}
                            >
                              -
                            </button>
                            <div className="px-3 py-1 text-sm min-w-[36px] text-center">
                              {isLoading ? "..." : qty}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleIncrease(item)}
                              disabled={isLoading}
                              className="px-3 py-1 text-sm disabled:opacity-60"
                              aria-label={`Increase quantity of ${item.item_name}`}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="overflow-auto scrollbar-hide flex flex-col max-h-100 scroll-hidden items-center justify-center p-8">
                <img
                  src="https://www.bbassets.com/bb2assets/images/png/no-search-results-found.png?tr=w-374,q-80"
                  alt="No items found"
                />
                <p className="text-gray-500 font-semibold">
                  Oops! No items found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
