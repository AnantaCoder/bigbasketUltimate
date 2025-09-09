import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addItemToCart } from '../app/slices/CartSlice';

const Card = ({ item }) => {
  const dispatch = useDispatch();

  if (!item) return null;

  const {
    id,
    item_name,
    price,
    image_urls,
    category,
    is_in_stock,
    manufacturer,
  } = item;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItemToCart(id));
  };

  const imageUrl = image_urls?.[0] || 'https://images.pexels.com/photos/32333373/pexels-photo-32333373.jpeg';

  return (
    <Link to={`/product/${id}`} state={{ item }} className="block">
      <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl}
            alt={item_name}
            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span 
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${
              is_in_stock ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {is_in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{category?.name || 'Uncategorized'}</p>
            <h3 className="mt-1 text-xl font-bold text-gray-800 line-clamp-2">
              {item_name}
            </h3>
            <p className="mt-1 text-xs text-gray-400">{manufacturer}</p>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-xs text-gray-500">Price</span>
              <p className="text-2xl font-extrabold text-gray-900">₹{price}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!is_in_stock}
              className={`rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 ${
                is_in_stock
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              {is_in_stock ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Card;
