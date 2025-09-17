import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItemToCart, saveItemForLater } from "../app/slices/CartSlice";
import WhyChooseUs from "./WhyIsEveryone";
import RatingAndReviews from "./RatingAndReviews";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductDetail() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPackSize, setSelectedPackSize] = useState(null);

  // Zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const mapApiItemToProduct = (apiItem) => {
    const images =
      apiItem.image_urls && apiItem.image_urls.length
        ? apiItem.image_urls
        : [apiItem.image || ""]; 
    const price = apiItem.price ? Number(apiItem.price) : 0;
    const mrp = apiItem.mrp
      ? Number(apiItem.mrp)
      : Number((price * 1.1).toFixed(2));
    const packSizes =
      apiItem.packSizes && apiItem.packSizes.length
        ? apiItem.packSizes
        : [
            { size: "1", price: price, mrp: mrp },
            {
              size: "0.5",
              price: Number((price * 0.6).toFixed(2)),
              mrp: Number((mrp * 0.6).toFixed(2)),
            },
          ];

    return {
      id: apiItem.id,
      name: apiItem.item_name || apiItem.name || "Product",
      brand:
        apiItem.manufacturer || (apiItem.seller && apiItem.seller.toString()) || "Brand",
      images,
      packSizes,
      description: apiItem.description || "",
      is_in_stock:
        typeof apiItem.is_in_stock !== "undefined"
          ? apiItem.is_in_stock
          : apiItem.quantity > 0,
      raw: apiItem,
    };
  };

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { id } = params;
        let apiItem = location.state?.item;

        if (!apiItem && id) {
          const response = await fetch(`/store/new-items/${id}/`);
          if (!response.ok) throw new Error(`Failed to fetch product (${response.status})`);
          apiItem = await response.json();
        }

        if (!apiItem) throw new Error("Product data not found.");

        const mapped = mapApiItemToProduct(apiItem);
        setProduct(mapped);
        setSelectedImage(mapped.images?.[0] || "");
        setSelectedPackSize(mapped.packSizes?.[0] || null);
      } catch (err) {
        setError(err?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, location.state?.item]);

  const handleAddToCart = () => {
    dispatch(addItemToCart(product.id));
  };

  const handleSaveForLater = () => {
    dispatch(saveItemForLater(product.id));
  };

  const handleNotifyMe = () => {
    toast.success("We will notify you when this item is back in stock!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Zoom handlers
  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="animate-pulse p-8 bg-white rounded-lg shadow">Loading product…</div>
    </div>
  );

  if (!product || error) return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6">
      <p className="text-gray-500 mb-4">Product could not be found.</p>
      <button onClick={() => navigate("/home")} className="px-4 py-2 bg-blue-600 text-white rounded">Back to Home</button>
    </div>
  );

  const currentPriceInfo = selectedPackSize || product.packSizes[0];
  const savings = currentPriceInfo.mrp - currentPriceInfo.price;
  const discountPercentage = currentPriceInfo.mrp ? Math.round((savings / currentPriceInfo.mrp) * 100) : 0;

  const currentImage = selectedImage || product.images?.[0] || "https://www.bbassets.com/media/uploads/p/m/10000102_20-fresho-cucumber.jpg?tr=w-154,q-80";

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <ToastContainer />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">&larr; Back</button>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Image section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 order-2 sm:order-1">
                {product.images?.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(img)} className={`w-20 h-20 border rounded-lg overflow-hidden ${selectedImage === img ? "ring-2 ring-red-400" : "border-gray-200"}`} aria-label={`Select thumbnail ${i + 1}`}>
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="relative flex-1 order-1 sm:order-2">
                {/* Full-size blurred background when out of stock */}
                {!product.is_in_stock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    {/* Blurred image full size (covers entire image area) */}
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${currentImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px) brightness(0.7)' }} />

                    {/* Optional translucent layer to slightly whiten the image */}
                    <div className="absolute inset-0 bg-white/30" />

                    {/* Badge sits above blurred background */}
                    <div className="relative z-20">
                      <span className="bg-red-600 text-white text-base font-bold px-6 py-3 rounded-full shadow-lg">Out of Stock</span>
                    </div>
                  </div>
                )}

                <div className={`relative w-full aspect-square border rounded-lg overflow-hidden ${!product.is_in_stock ? "opacity-60" : ""}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}>
                  {/* main image */}
                  <img src={currentImage} alt="Main product" className="w-full h-full object-cover" />

                  {/* Zoom overlay (centered) */}
                  {isZooming && (
                    <div className="fixed top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden z-50 pointer-events-none" style={{ backgroundImage: `url(${currentImage})`, backgroundRepeat: 'no-repeat', backgroundSize: '250%', backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%` }} aria-hidden />
                  )}
                </div>
              </div>
            </div>

            {/* Details section */}
            <div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-gray-500 uppercase">{product.brand}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">{product.name} ({selectedPackSize?.size || product.packSizes?.[0]?.size})</h1>

              <div className="mt-4">
                <p className="text-3xl font-extrabold text-gray-800">₹{currentPriceInfo.price.toFixed(2)}
                  <span className="text-lg text-gray-500 font-medium ml-2"> (₹{(currentPriceInfo.price / (parseFloat(selectedPackSize?.size) || 1)).toFixed(2)} / kg)</span>
                </p>
                <p className="text-base text-gray-400 line-through">MRP: ₹{currentPriceInfo.mrp.toFixed(2)}</p>
                <p className="text-green-600 font-bold mt-1">You Save: {discountPercentage}% OFF</p>
                <p className="text-xs text-gray-400 mt-1">(inclusive of all taxes)</p>
              </div>

              <div className="my-6 space-y-4">
                {product.is_in_stock ? (
                  <>
                    <div className="space-y-3">
                      <button onClick={handleAddToCart} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-red-700" aria-label="Add to basket">Add to basket</button>
                      <button onClick={handleSaveForLater} className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100" aria-label="Save for later">Save for later</button>
                    </div>
                  </>
                ) : (
                  <div>
                    <button onClick={handleNotifyMe} className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-600" aria-label="Notify me">Notify Me</button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3">Pack sizes</h3>
                <div className="space-y-3">
                  {product.packSizes.map((pack) => (
                    <button key={pack.size} onClick={() => setSelectedPackSize(pack)} className={`w-full text-left p-4 border rounded-lg flex items-center justify-between ${selectedPackSize?.size === pack.size ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"}`} disabled={!product.is_in_stock}>
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${selectedPackSize?.size === pack.size ? "bg-green-600 text-white" : "bg-gray-300"}`}>{selectedPackSize?.size === pack.size ? "✓" : ""}</div>
                        <div>
                          <p className="font-bold text-gray-900">{pack.size}</p>
                          <p className="text-sm text-gray-600">₹{pack.price.toFixed(2)} <span className="line-through text-gray-400 ml-2">₹{pack.mrp.toFixed(2)}</span></p>
                        </div>
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">5 MINS</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <WhyChooseUs />

          <div className="border mt-5 px-4 rounded py-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">About the Product</h2>
              <div dangerouslySetInnerHTML={{ __html: product.description }} className="text-gray-700 leading-relaxed" />
            </div>
          </div>

        </div>

        <RatingAndReviews />
      </div>
    </div>
  );
}
