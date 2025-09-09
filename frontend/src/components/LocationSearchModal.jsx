import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";

function LocationSearchModal({ isOpen, onClose, selectedLocation, setSelectedLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await api.get("/store/search-address/", {
          params: { q: query },
        });
        setResults(response.data.results || []);
      } catch (error) {
        console.error("Failed to fetch address search results", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSelect = (location) => {
    setSelectedLocation(location);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-20 z-50">
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
      >
        <h2 className="text-lg font-bold mb-2">Select a location for delivery</h2>
        <p className="mb-4 text-gray-600">
          Choose your address location to see product availability and delivery options
        </p>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Search for area or street name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <div className="text-gray-500 mb-2">Loading...</div>}
        <ul className="max-h-60 overflow-y-auto">
          {results.length === 0 && !loading && (
            <li className="text-gray-500">No results found</li>
          )}
          {results.map((result) => (
            <li
              key={result.id}
              className="cursor-pointer p-2 hover:bg-emerald-100 rounded"
              onClick={() => handleSelect(`${result.pincode}, ${result.name}`)}
            >
              {result.pincode}, {result.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LocationSearchModal;
