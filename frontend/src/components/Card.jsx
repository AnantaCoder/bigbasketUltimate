import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux"; // ✅ real redux dispatch
import { addItemToCart } from "../app/slices/CartSlice"; // ✅ import thunk

// Clock Icon
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-3 w-3 mr-1 inline-block"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
      clipRule="evenodd"
    />
  </svg>
);

// Bookmark Icon
const BookmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const Card = ({ item }) => {
  const dispatch = useDispatch(); // ✅ redux dispatcher

  if (!item) return null;

  const {
    id,
    item_name,
    price,
    image_urls,
    manufacturer,
    originalPrice = price * 1.35,
    discount = "26% OFF",
    packInfo = "2 packs",
    deliveryTime = "5 MINS",
    packOptions = ["2 x 1 kg - Multipack", "1 kg"],
  } = item;

  // ✅ Trigger redux thunk on button click
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItemToCart(id)); // thunk call
  };

  const imageUrl =
    image_urls?.[0] ||
    "https://www.bbassets.com/media/uploads/p/m/10000102_20-fresho-cucumber.jpg?tr=w-154,q-80";

  return (
    <Link to={`/product/${id}`} state={{ item }} className="block">
      <article className="w-full bg-white border border-gray-200 rounded-lg shadow-sm font-sans flex flex-col">
        {/* Image + Discount Tag */}
        <div className="relative p-2">
          <div className="absolute top-2 left-2 bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            {discount}
          </div>
          <div className="overflow-hidden rounded-md">
            <img
              src={imageUrl}
              alt={item_name}
              className="w-full aspect-square object-cover"
            />
          </div>
          {packInfo && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs font-semibold px-3 py-1 rounded-md">
              {packInfo}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-grow flex flex-col">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {manufacturer || "Brand"}
            </p>
            <span className="bg-yellow-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
              <ClockIcon />
              {deliveryTime}
            </span>
          </div>

          <h3 className="mt-2 text-base font-semibold text-gray-800 truncate">
            {item_name}
          </h3>

          {/* Pack Selector */}
          <select className="mt-3 w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400">
            {packOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="flex-grow"></div>

          {/* Price */}
          <div className="mt-4">
            <p className="text-lg font-bold text-gray-900">
              ₹{price}
              <span className="ml-2 text-sm font-normal text-gray-500 line-through">
                ₹{Math.round(originalPrice)}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between space-x-2">
            <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <BookmarkIcon />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full border border-red-500 text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              Add
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Card;
