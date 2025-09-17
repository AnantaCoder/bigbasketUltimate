import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../components/Breadcrumb";
import { toast } from "react-toastify";
import {
  ChevronDown,
  MapPin,
  Search,
  Trash2,
  Star,
  Plus,
  List,
} from "lucide-react";

// Icons
const AddIcon = () => <Plus size={20} />;
const DeleteIcon = () => <Trash2 size={20} />;
const DefaultIcon = () => <Star size={20} />;
const SearchIcon = () => <Search size={20} />;
const LocationIcon = () => <MapPin size={20} />;
const DropdownIcon = () => <ChevronDown size={20} />;
const ListIcon = () => <List size={20} />;

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Toggle form type
  const [formType, setFormType] = useState("manual"); // "manual" | "map"

  // Manual form
  const [manualForm, setManualForm] = useState({
    phone_no: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });
  const [manualLoading, setManualLoading] = useState(false);

  // Map form
  const [mapForm, setMapForm] = useState({
    phone_no: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });
  const [mapSrc, setMapSrc] = useState(
    "https://www.openstreetmap.org/export/embed.html?bbox=77.5,12.9,77.65,12.98&layer=mapnik"
  );
  const [mapLoading, setMapLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  // Suggestions for search
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef(null);

  // Validation functions
  const validateForm = (form) => {
    if (!form.phone_no.trim()) {
      toast.error("Phone number is required.");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone_no.trim())) {
      toast.error("Phone number must be exactly 10 digits.");
      return false;
    }
    if (!form.address.trim()) {
      toast.error("Address is required.");
      return false;
    }
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Pincode must be exactly 6 digits.");
      return false;
    }
    return true;
  };

  // Fetch addresses with pagination
  const fetchAddresses = async (pageNum = 1) => {
    const token = localStorage.getItem("access_token");
    setLoadingAddresses(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/store/order-users/?page=${pageNum}&page_size=${pageSize}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();

      // Validate response
      if (data && Array.isArray(data.results)) {
        setAddresses(data.results);
        setTotalPages(
          Math.ceil((data.count || data.results.length) / pageSize)
        );
      } else {
        setAddresses([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses(page);
  }, [page]);

  // ================= Manual Form =================
  const handleManualChange = (e) => {
    const { name, value, type, checked } = e.target;
    setManualForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitManualForm = async () => {
    if (!validateForm(manualForm)) {
      return;
    }

    const token = localStorage.getItem("access_token");
    setManualLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/store/order-users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(manualForm),
      });
      if (!res.ok) throw new Error("Failed to save address");
      toast.success("Address saved successfully");
      setManualForm({
        phone_no: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      fetchAddresses(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    } finally {
      setManualLoading(false);
    }
  };

  // ================= Map Form =================
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
    return parts.join(", ") || props.street || props.county || props.country;
  };

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
      const data = await res.json();
      const items = (data.features || []).map((f) => {
        const [lon, lat] = f.geometry?.coordinates || [null, null];
        return {
          id: f.properties.osm_id || Math.random().toString(36).slice(2),
          lat,
          lon,
          display_name: buildDisplayName(f.properties),
          properties: f.properties,
        };
      });
      setSuggestions(items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suggestions.");
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  const handleSelectSuggestion = (place) => {
    setSuggestions([]);
    setQuery(place.display_name);
    setMapForm((prev) => ({
      ...prev,
      address: place.display_name,
      city: place.properties?.city || "",
      state: place.properties?.state || "",
      pincode: place.properties?.postcode || "",
    }));
    const lat = Number(place.lat);
    const lon = Number(place.lon);
    const delta = 0.01;
    setMapSrc(
      `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${
        lat - delta
      },${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`
    );
  };

  const handleMapFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMapForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitMapForm = async () => {
    if (!validateForm(mapForm)) {
      return;
    }

    const token = localStorage.getItem("access_token");
    setMapLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/store/order-users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(mapForm),
      });
      if (!res.ok) throw new Error("Failed to save address");
      toast.success("Address saved successfully");
      setMapForm({
        phone_no: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      setQuery("");
      setSuggestions([]);
      fetchAddresses(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    } finally {
      setMapLoading(false);
    }
  };

  // ================= Address Actions =================
  const deleteAddress = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://127.0.0.1:8000/api/store/order-users/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete address");
      toast.success("Address deleted");
      fetchAddresses(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://127.0.0.1:8000/api/store/order-users/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ is_default: true }),
        }
      );
      if (!res.ok) throw new Error("Failed to set default address");
      toast.success("Default address set");
      fetchAddresses(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to set default address");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 space-y-8">
        <Breadcrumb />
        <h1 className="text-2xl font-bold mb-4">Addresses</h1>

        {/* Toggle Switch */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-md font-semibold ${
              formType === "manual"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setFormType("manual")}
          >
            Add Manually
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold ${
              formType === "map"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setFormType("map")}
          >
            Add via Map
          </button>
        </div>

        {/* Manual Form */}
        {formType === "manual" && (
          <section className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AddIcon /> Add Address Manually
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="tel"
                name="phone_no"
                value={manualForm.phone_no}
                onChange={handleManualChange}
                placeholder="Phone Number (10 digits)"
                className="border p-3 rounded-md"
                maxLength={10}
              />
              <textarea
                name="address"
                value={manualForm.address}
                onChange={handleManualChange}
                placeholder="Address"
                rows={3}
                className="border p-3 rounded-md md:col-span-2"
              />
              <input
                type="text"
                name="city"
                value={manualForm.city}
                onChange={handleManualChange}
                placeholder="City"
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                name="state"
                value={manualForm.state}
                onChange={handleManualChange}
                placeholder="State"
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                name="pincode"
                value={manualForm.pincode}
                onChange={handleManualChange}
                placeholder="Pincode (6 digits)"
                className="border p-3 rounded-md"
                maxLength={6}
              />
              <label className="flex items-center space-x-2 text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={manualForm.is_default}
                  onChange={handleManualChange}
                  className="h-5 w-5 text-green-600 rounded"
                />
                <span>Set as default</span>
              </label>
            </div>
            <button
              onClick={submitManualForm}
              disabled={manualLoading}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-md font-semibold disabled:bg-gray-400"
            >
              {manualLoading ? "Saving..." : "Save Address"}
            </button>
          </section>
        )}

        {/* Map Form */}
        {formType === "map" && (
          <section className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <LocationIcon /> Add Address via Map
            </h2>
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for address, shop, or place"
                className="w-full border px-3 py-3 rounded-md pr-10"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <SearchIcon />
              </span>
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-64 overflow-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative h-64 border rounded-md overflow-hidden mt-4">
              <iframe
                title="Delivery Location Map"
                src={mapSrc}
                className="w-full h-full"
                frameBorder="0"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="tel"
                name="phone_no"
                value={mapForm.phone_no}
                onChange={handleMapFormChange}
                placeholder="Phone Number (10 digits)"
                className="border p-3 rounded-md"
                maxLength={10}
              />
              <textarea
                name="address"
                value={mapForm.address}
                onChange={handleMapFormChange}
                placeholder="Address"
                rows={3}
                className="border p-3 rounded-md md:col-span-2"
              />
              <input
                type="text"
                name="city"
                value={mapForm.city}
                onChange={handleMapFormChange}
                placeholder="City"
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                name="state"
                value={mapForm.state}
                onChange={handleMapFormChange}
                placeholder="State"
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                name="pincode"
                value={mapForm.pincode}
                onChange={handleMapFormChange}
                placeholder="Pincode (6 digits)"
                className="border p-3 rounded-md"
                maxLength={6}
              />
              <label className="flex items-center space-x-2 text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={mapForm.is_default}
                  onChange={handleMapFormChange}
                  className="h-5 w-5 text-green-600 rounded"
                />
                <span>Set as default</span>
              </label>
            </div>
            <button
              onClick={submitMapForm}
              disabled={mapLoading}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-md font-semibold disabled:bg-gray-400"
            >
              {mapLoading ? "Saving..." : "Save Address"}
            </button>
          </section>
        )}

        {/* All Addresses Section */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Your Saved Addresses</h2>
          {loadingAddresses ? (
            <p className="text-gray-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-500">
              No addresses found. Add a new one above!
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className="border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        {addr.is_default && (
                          <span className="text-green-600">
                            <DefaultIcon size={16} />
                          </span>
                        )}
                        {addr.address}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Phone: {addr.phone_no}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-2">
                      {!addr.is_default && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Addresses;
