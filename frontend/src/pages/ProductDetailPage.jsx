import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItem, selectItemDetail, selectItemsError, selectItemsLoading } from '../app/slices/itemsSlice';
import { addItemToCart } from '../app/slices/CartSlice';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const item = useSelector(selectItemDetail);
  const loading = useSelector(selectItemsLoading);
  const error = useSelector(selectItemsError);

  useEffect(() => {
    if (id) {
      dispatch(fetchItem(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (item) {
      dispatch(addItemToCart(item.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/home" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Product Not Found</h2>
          <Link to="/home" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = item.image_urls?.[0] || 'https://images.pexels.com/photos/32333373/pexels-photo-32333373.jpeg';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/home" className="text-blue-600 hover:text-blue-800">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{item.item_name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <img
                src={imageUrl}
                alt={item.item_name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  item.is_in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.is_in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.item_name}</h1>

              <p className="text-gray-600 mb-4">{item.category?.name || 'Uncategorized'}</p>

              <p className="text-gray-500 mb-4">By {item.manufacturer}</p>

              <div className="text-4xl font-bold text-gray-900 mb-6">₹{item.price}</div>

              {item.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!item.is_in_stock}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    item.is_in_stock
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {item.is_in_stock ? 'Add to Cart' : 'Unavailable'}
                </button>

                <Link
                  to="/home"
                  className="py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
