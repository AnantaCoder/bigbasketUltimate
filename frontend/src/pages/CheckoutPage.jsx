import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCart,
  fetchCart,
  selectCartStatus,
} from "../app/slices/CartSlice";
import { toast } from "react-toastify";
import CheckoutHeader from "../components/CheckoutHeader";
import RazorpayCheckout from "../components/RazorpayCheckout";

function CheckoutPage() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const status = useSelector(selectCartStatus);
  const authToken = useSelector((s) => s.auth?.accessToken);
  const user = useSelector((s) => s.auth?.user); // eslint-disable-line no-unused-vars

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCart());
    }
  }, [status, dispatch]);

  // Update phone number when user changes
  useEffect(() => {
    if (user?.phone) {
      setAddressForm((prev) => ({ ...prev, phone_no: user.phone }));
    }
  }, [user]);

  const totalAmountPayable =
    cart && cart.total_price !== undefined
      ? cart.total_price
      : cart && cart.items
      ? cart.items.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        )
      : 0;

  const totalSavings = 0;

  // Photon search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapSrc, setMapSrc] = useState(
    "https://www.openstreetmap.org/export/embed.html?bbox=77.5,12.9,77.65,12.98&layer=mapnik"
  );
  const [reverseLoading, setReverseLoading] = useState(false);
  const [orderUserId, setOrderUserId] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    phone_no: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // debouncing
  const debounceRef = useRef(null);

  const buildDisplayName = (props) => {
    const parts = [];
    if (props.name) parts.push(props.name);
    if (props.street) {
      let street = props.street;
      if (props.housenumber) street = `${props.housenumber} ${street}`;
      parts.push(street);
    }
    if (props.city) parts.push(props.city);
    if (props.state && !parts.includes(props.state)) parts.push(props.state);
    if (props.country) parts.push(props.country);
    return (
      parts.join(", ") ||
      props.street ||
      props.county ||
      props.country ||
      "(unnamed)"
    );
  };

  // fetch suggestions from Photon
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestLoading(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        q
      )}&limit=8`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Photon search failed");
      const data = await res.json();
      const items = (data.features || []).map((f) => {
        const [lon, lat] = f.geometry?.coordinates || [null, null];
        return {
          id: f.properties.osm_id
            ? `${f.properties.osm_type}_${f.properties.osm_id}`
            : f.properties.osm_id || Math.random().toString(36).slice(2),
          lat,
          lon,
          display_name: buildDisplayName(f.properties),
          properties: f.properties,
        };
      });
      setSuggestions(items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suggestions — try again later.");
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  // debounce queries
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  // when selecting a suggestion
  const handleSelectSuggestion = (place) => {
    setSelectedPlace(place);
    setSuggestions([]);
    setQuery(place.display_name);

    // populate form fields
    setAddressForm({
      phone_no: addressForm.phone_no, // keep existing
      address: place.display_name,
      city: place.properties?.city || "",
      state: place.properties?.state || "",
      pincode: "", // photon may not have pincode
    });

    // compute bbox ~ small box around point
    const lat = Number(place.lat);
    const lon = Number(place.lon);
    const delta = 0.01; // ~1km box, adjust if you want
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    setMapSrc(src);
  };

  // reverse geocode with photon (used for "Get current location")
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in this browser.");
      return;
    }
    setReverseLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`
          );
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          const f = data.features && data.features[0];
          if (!f) {
            toast.error("Could not determine address for current location.");
            setReverseLoading(false);
            return;
          }
          const place = {
            lat,
            lon,
            display_name: buildDisplayName(f.properties),
            properties: f.properties,
          };
          setSelectedPlace(place);
          setQuery(place.display_name);

          // populate form fields
          setAddressForm({
            phone_no: addressForm.phone_no, // keep existing
            address: place.display_name,
            city: f.properties?.city || "",
            state: f.properties?.state || "",
            pincode: "", // photon may not have pincode
          });

          const delta = 0.01;
          const bbox = `${lon - delta},${lat - delta},${lon + delta},${
            lat + delta
          }`;
          setMapSrc(
            `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
          );
        } catch (err) {
          console.error(err);
          toast.error("Failed to reverse geocode current location.");
        } finally {
          setReverseLoading(false);
        }
      },
      (err) => {
        console.error(err);
        toast.error(
          "Unable to get current location. Permission denied or unavailable."
        );
        setReverseLoading(false);
      }
    );
  };

  // send selected location to backend (create order_user)
  const sendLocation = async () => {
    if (!addressForm.phone_no || !addressForm.address || !addressForm.city) {
      toast.error("Please fill in all required fields: Phone, Address, City.");
      return;
    }

    const payload = {
      phone_no: addressForm.phone_no,
      address: addressForm.address,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/store/order-users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Server rejected address");
      }

      const respData = await res.json().catch(() => ({}));
      toast.success("Address saved successfully.");
      setOrderUserId(respData.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address. Check your backend or network.");
    }
  };

  // create order after address is saved
  const createOrder = async () => {
    if (!orderUserId) {
      toast.error("Please save address first.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/store/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ order_user_id: orderUserId }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Failed to create order");
      }

      const respData = await res.json().catch(() => ({}));
      toast.success("Order created successfully.");
      setOrderId(respData.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order. Check your backend or network.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <CheckoutHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 flex space-x-6">
        {/* Left: Add new address (search + map) */}
        <section className="flex-1 bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Add new address</h2>

          {/* Search box */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Search address
            </label>
            <div className="relative mt-1">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for address, shop, or place (e.g., 'Koramangala, Bengaluru')"
                className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {suggestLoading && (
                <div className="absolute right-3 top-2 text-sm text-gray-500">
                  Loading…
                </div>
              )}

              {suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 bg-white border mt-1 rounded shadow max-h-64 overflow-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(s)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSelectSuggestion(s);
                      }}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Map + controls */}
          <div className="relative h-96 border rounded overflow-hidden">
            <iframe
              title="Delivery Location Map"
              src={mapSrc}
              className="w-full h-full"
              frameBorder="0"
              aria-hidden="false"
              tabIndex="0"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleGetCurrentLocation}
                disabled={reverseLoading}
                className="bg-black bg-opacity-70 text-white px-3 py-2 rounded flex items-center space-x-1 hover:bg-opacity-85"
                title="Detect my location"
              >
                <span className="material-icons">my_location</span>
                <span>
                  {reverseLoading ? "Detecting..." : "Get current location"}
                </span>
              </button>
              <button
                onClick={() => {
                  // clear selection to let user search again
                  setSelectedPlace(null);
                  setQuery("");
                  setSuggestions([]);
                  setMapSrc(
                    "https://www.openstreetmap.org/export/embed.html?bbox=77.5,12.9,77.65,12.98&layer=mapnik"
                  );
                }}
                className="bg-white text-black px-3 py-2 rounded shadow"
              >
                Clear
              </button>
            </div>

            {/* bottom overlay with quick summary */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">Delivery Location</div>
                <div className="text-sm">
                  {selectedPlace
                    ? selectedPlace.display_name
                    : "No location selected"}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!selectedPlace) {
                    toast.info(
                      "Select a location first (from search or get current location)."
                    );
                    return;
                  }
                  // copy to clipboard as convenience
                  navigator.clipboard
                    ?.writeText(selectedPlace.display_name)
                    .then(
                      () => {
                        toast.success("Address copied to clipboard");
                      },
                      () => {}
                    );
                }}
                className="bg-red-600 px-4 py-2 rounded text-white font-semibold hover:bg-red-700"
              >
                Copy address
              </button>
            </div>
          </div>

          {/* Address Form */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Address Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={addressForm.phone_no}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone_no: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="mt-1 w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address: e.target.value })
                  }
                  placeholder="Enter full address"
                  rows={3}
                  className="mt-1 w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    placeholder="Enter city"
                    className="mt-1 w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    placeholder="Enter state"
                    className="mt-1 w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pincode
                </label>
                <input
                  type="text"
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, pincode: e.target.value })
                  }
                  placeholder="Enter pincode"
                  className="mt-1 w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="w-96 bg-white rounded shadow p-6 flex flex-col space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Order Summary</h2>
          <div className="flex justify-between">
            <span>Total Amount Payable</span>
            <span className="font-semibold">₹{totalAmountPayable}</span>
          </div>
          <div className="flex justify-between bg-green-100 text-green-800 p-2 rounded">
            <span>Total Savings</span>
            <span className="font-semibold">₹{totalSavings} ▼</span>
          </div>

          <div className="bg-yellow-100 border border-yellow-400 p-3 rounded text-sm">
            Select your address and delivery slot to know accurate delivery
            charges. You can save more by applying a voucher!
          </div>

          <div className="pt-2 border-t">
            <h3 className="font-semibold text-gray-700">Selected Location</h3>
            {!selectedPlace ? (
              <p className="text-gray-500 text-sm mt-2">
                No place selected yet.
              </p>
            ) : (
              <div className="mt-2 space-y-2 text-sm text-gray-800">
                <div className="font-semibold">
                  {selectedPlace.display_name}
                </div>
                <div>
                  <span className="font-medium">Latitude:</span>{" "}
                  {selectedPlace.lat}
                </div>
                <div>
                  <span className="font-medium">Longitude:</span>{" "}
                  {selectedPlace.lon}
                </div>
                {selectedPlace.properties && (
                  <div className="text-xs text-gray-600">
                    {selectedPlace.properties.street && (
                      <div>Street: {selectedPlace.properties.street}</div>
                    )}
                    {selectedPlace.properties.city && (
                      <div>City: {selectedPlace.properties.city}</div>
                    )}
                    {selectedPlace.properties.country && (
                      <div>Country: {selectedPlace.properties.country}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={sendLocation}
                disabled={
                  !addressForm.phone_no ||
                  !addressForm.address ||
                  !addressForm.city
                }
                className={`w-full py-2 rounded font-semibold ${
                  addressForm.phone_no &&
                  addressForm.address &&
                  addressForm.city
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save Address
              </button>
              {orderUserId && !orderId && (
                <button
                  onClick={createOrder}
                  className="w-full py-2 rounded font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Order
                </button>
              )}
            </div>
          </div>

          {/* Payment Section */}
          {orderId && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-4">Payment</h3>
              <RazorpayCheckout
                orderId={orderId}
                amount={totalAmountPayable}
                onSuccess={(data) => {
                  toast.success("Payment successful!");
                  console.log("Payment Data:", data);
                  // Here you can handle post-payment logic like redirecting to order confirmation
                }}
                onError={(error) => {
                  toast.error("Payment failed: " + error);
                }}
              />
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default CheckoutPage;
