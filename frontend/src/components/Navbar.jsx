import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import LoginSignupModal from "../features/LoginSignup";
import CartDropdown from "./CartDropdown";
import CategoryDropdown from "./CategoryDropdown";
import UserDropdown from "./UserDropdown";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../app/slices/authSlice";

import { selectCart } from "../app/slices/CartSlice";
import axios from "axios";

import { CloudLightning, ThumbsDown, Zap } from "lucide-react";

// --- ICONS ---
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-700 hover:text-red-500 transition-colors"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

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

const LocationPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2 text-emerald-600"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="white"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BasketIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-500"
  >
    <path d="M5 11h14l-1.5 6.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-2.5L5 11z" />
    <path d="M17.5 11l-1.5-7h-8L6.5 11" />
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Search state and ref
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  const searchTimeoutRef = useRef(null);

  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cart = useSelector(selectCart);

  // Sync searchQuery state with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    setSearchQuery(searchParam);
  }, [location.search]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen ||
      isCartOpen ||
      isCategoryOpen ||
      isUserDropdownOpen ||
      isLocationSearchOpen ||
      showSearchModal
        ? "hidden"
        : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    isMobileMenuOpen,
    isCartOpen,
    isCategoryOpen,
    isUserDropdownOpen,
    isLocationSearchOpen,
    showSearchModal,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
      setShowSearchModal(false);
    }
  };

  const handleLocationSearch = async (e) => {
    const query = e.target.value;
    setLocationQuery(query);

    if (query.length > 2) {
      try {
        const res = await axios.get(`/api/search-address/?q=${query}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Debounced search input change handler
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await axios.get(
            `/api/store/items/?search=${encodeURIComponent(query)}`
          );
          // Assuming the API returns an array of items
          setSearchItems(res.data);
          setShowSearchModal(true);
        } catch (err) {
          console.error("Error fetching search items:", err);
          setSearchItems([]);
          setShowSearchModal(false);
        }
      }, 10); // Debounce time
    } else {
      setSearchItems([]);
      setShowSearchModal(false);
    }
  };

  // Handle click on search item to navigate to product detail page
  const handleSearchItemClick = (item) => {
    setShowSearchModal(false);
    navigate(`/product/${item.id}`, { state: { item } });
  };

  const handleSelectLocation = () => {
    setIsLocationSearchOpen(false);
    setLocationQuery("");
    setSearchResults([]);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/home?search=${categoryName}`);
  };

  const handleNandiniClick = () => {
    navigate(`/home?search=nandini`);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 shadow-lg font-sans relative">
      {/* Top bar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-1">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <img src="/newlogo.png" className="h-20 w-auto scale-220" />
            </div>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-grow max-w-3xl mx-8 relative"
            >
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search for Products..."
                  className="w-full border-2 border-gray-200 rounded-xl py-3 pl-5 pr-14 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-sm group-hover:shadow-md"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4 bg-gradient-to-r from-[#5E9400] to-[#5E9400] hover:from-[#5E9400] hover:to-[#5E9400] rounded-r-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <SearchIcon />
                </button>
                {showSearchModal && searchItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {searchItems.map((item) => (
                        <li
                          key={item.id}
                          className="cursor-pointer px-4 py-2 hover:bg-emerald-100"
                          onClick={() => handleSearchItemClick(item)}
                        >
                          {item.item_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>

            {/* Right Side */}
            <div className="flex items-center space-x-4 md:space-x-8 relative">
              {/* Location */}
              <div
                className="hidden lg:flex items-center group cursor-pointer"
                onClick={() => setIsLocationSearchOpen(true)}
              >
                <div className="text-sm text-[#5E9400] font-bold bg-gray-200 px-10 py-1 rounded-xl justify-start ">
                  <div className="flex ">
                    <Zap />
                    Delivery in 5 mins
                  </div>
                  <div className="text-gray-600">See Locations</div>
                </div>
              </div>
              {isLocationSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative z-50">
                    <button
                      onClick={() => setIsLocationSearchOpen(false)}
                      className="absolute top-3 right-3"
                      aria-label="Close location search"
                    >
                      <CloseIcon />
                    </button>
                    <h2 className="text-lg font-bold mb-4">
                      Select a location for delivery
                    </h2>
                    <p className="mb-4 text-gray-700">
                      Choose your address location to see product availability
                      and delivery options
                    </p>
                    <input
                      type="text"
                      placeholder="Search for area or street name"
                      value={locationQuery}
                      onChange={handleLocationSearch}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <ul className="max-h-60 overflow-y-auto">
                      {searchResults.length === 0 &&
                        locationQuery.length > 2 && (
                          <li className="text-gray-500">No results found</li>
                        )}
                      {searchResults.map((loc) => (
                        <li
                          key={loc.id}
                          className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded"
                          onClick={() => handleSelectLocation(loc)}
                        >
                          {loc.pincode}, {loc.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className="fixed inset-0 backdrop-blur-md bg-transparent"
                    onClick={() => setIsLocationSearchOpen(false)}
                  ></div>
                </div>
              )}

              {/* Auth Section */}
              {!isAuthenticated ? (
                <div
                  onClick={() => setShowModal(true)}
                  className="hidden lg:flex items-center text-sm text-gray-700 hover:text-emerald-600 cursor-pointer group transition-all duration-200 hover:bg-emerald-50 px-3 py-2 rounded-lg"
                >
                  <div className="bg-gray-300 p-2 rounded-xl ">
                    <img
                      src="/dp.png"
                      alt="Display Picture"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex items-center relative">
                  <button onClick={toggleUserDropdown} aria-label="User menu">
                    <UserIcon />
                  </button>
                  {isUserDropdownOpen && (
                    <UserDropdown
                      onClose={() => setIsUserDropdownOpen(false)}
                    />
                  )}
                </div>
              )}
              {showModal && (
                <LoginSignupModal closeModal={() => setShowModal(false)} />
              )}

              {/* Basket */}
              <div
                onClick={toggleCart}
                className="bg-red-200 pl-2 py-2 pr-2 rounded-xl relative"
                aria-label="Toggle cart dropdown"
              >
                <div
                  onClick={() => navigate("/cart")}
                  className="text-sm hidden xl:block"
                >
                  <BasketIcon />
                </div>
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                  {cart?.cart_items?.length || 0}
                </span>
              </div>
              {isCartOpen && (
                <CartDropdown onClose={() => setIsCartOpen(false)} />
              )}

              {/* Mobile Hamburger */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  <MenuIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav - Desktop */}
      <div className="container mx-auto px-4 hidden lg:block bg-gradient-to-r from-gray-50 to-white relative">
        <div className="flex items-center justify-between py-3 ml-30">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="bg-gradient-to-r from-[#5E9400] to-[#5E9400] hover:from-[#5E9400] hover:to-[#5E9400] text-white font-bold py-3 px-6 rounded-xl flex items-center text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            aria-haspopup="true"
            aria-expanded={isCategoryOpen}
          >
            <div className="justify-start pl-2 pr-9 flex gap-2 items-start">
              <span>Shop By Category</span>
            </div>
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform duration-300 ${
                isCategoryOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {isCategoryOpen && (
            <CategoryDropdown onClose={() => setIsCategoryOpen(false)} />
          )}
          <div className="flex items-center space-x-8 text-sm font-semibold">
            <button
              onClick={() =>
                handleCategoryClick("exotic fruits and vegetables")
              }
              className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg"
            >
              Exotic Fruits and Vegetables
            </button>
            <button
              onClick={() => handleCategoryClick("tea")}
              className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg"
            >
              Tea
            </button>
            <button
              onClick={() => handleCategoryClick("ghee")}
              className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg"
            >
              Ghee
            </button>
            <button
              onClick={handleNandiniClick}
              className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg"
            >
              Nandini
            </button>
            <button
              onClick={() => handleCategoryClick("Vegetables")}
              className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg"
            >
              Fresh Vegetables
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className="relative w-4/5 max-w-xs h-full bg-white shadow-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <img
              src={logo}
              alt="Logo"
              className="h-8 w-auto cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/home");
              }}
            />
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
              <CloseIcon />
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="mb-6 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search for Products..."
                  className="w-full border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 bg-emerald-600 hover:bg-emerald-700 rounded-r-lg transition-colors"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>
            {showSearchModal && searchItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <ul>
                  {searchItems.map((item) => (
                    <li
                      key={item.id}
                      className="cursor-pointer px-4 py-2 hover:bg-emerald-100"
                      onClick={() => handleSearchItemClick(item)}
                    >
                      {item.item_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <nav className="flex flex-col space-y-5 text-[#5E9400] font-semibold">
            {!isAuthenticated ? (
              <div
                onClick={() => {
                  setShowModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center text-md cursor-pointer group"
              >
                <UserIcon />
                <span>Login / Sign Up</span>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserIcon />
                  </div>
                  <span className="text-sm font-semibold">
                    Hi, {user?.first_name || user?.email}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await dispatch(logoutUser());
                    setIsMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="text-red-600 font-medium hover:underline text-left"
                >
                  Logout
                </button>
              </div>
            )}

            <div className="flex items-center group cursor-pointer border-t pt-4">
              <ThumbsDown />
              <div className="text-sm">
                <div className="font-bold text-gray-800">560004, Bangalore</div>
              </div>
            </div>

            <button className="w-full bg-[#5E9400] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-sm mt-4">
              <MenuIcon />
              <span className="mx-2">SHOP BY CATEGORY</span>
              <ChevronDownIcon className="h-5 w-5" />
            </button>

            <div className="flex flex-col space-y-4 pt-4 border-t">
              <button
                onClick={() => {
                  handleCategoryClick("exotic fruits and vegetables");
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-emerald-600 text-left"
              >
                Exotic Fruits and Vegetables
              </button>
              <button
                onClick={() => {
                  handleCategoryClick("tea");
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-emerald-600 text-left"
              >
                Tea
              </button>
              <button
                onClick={() => {
                  handleCategoryClick("ghee");
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-emerald-600 text-left"
              >
                Ghee
              </button>
              <button
                onClick={() => {
                  handleNandiniClick();
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-emerald-600 text-left"
              >
                Nandini
              </button>
              <button
                onClick={() => {
                  handleCategoryClick("fresh Vegetables");
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-emerald-600 text-left"
              >
                Fresh Vegetables
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
