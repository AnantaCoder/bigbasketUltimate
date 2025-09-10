import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchItems } from "../app/slices/itemsSlice";
import Card from "../components/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CardCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const slice = useSelector((s) => s.items);
  const { results, items, loading } = slice || {};

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    dispatch(fetchItems({ page: 1, pageSize: 6 }));
  }, [dispatch]);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atLeft = Math.round(el.scrollLeft) <= 0;
    const atRight =
      Math.round(el.scrollLeft + el.clientWidth) >= Math.round(el.scrollWidth - 1);
    setCanScrollLeft(!atLeft);
    setCanScrollRight(!atRight);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, results, items, loading]);

  // Scroll programmatically by number of visible cards
  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const cardWidth = 220; // same as min-w used for each card
    const gap = 16; // space-x-4
    const visibleCards = Math.max(1, Math.floor(containerWidth / (cardWidth + gap)));
    const amount = visibleCards * (cardWidth + gap);
    const target =
      direction === "left"
        ? Math.max(0, el.scrollLeft - amount)
        : Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + amount);

    el.scrollTo({ left: target, behavior: "smooth" });
    // update button states after smooth scroll (best-effort)
    setTimeout(updateScrollButtons, 300);
  };

  const displayed = results?.length ? results : items?.length ? items : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">New Arrivals</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/home")}
            className="text-sm font-semibold text-gray-700 hover:text-red-500 transition-colors"
          >
            View All
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`p-2 rounded-full border border-gray-300 bg-white text-gray-600 transition-all duration-200 ${
                !canScrollLeft ? "opacity-40 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`p-2 rounded-full border border-gray-300 bg-white text-gray-600 transition-all duration-200 ${
                !canScrollRight ? "opacity-40 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Cards — user scroll disabled */}
      <div
        ref={scrollRef}
        // prevent user input scrolling
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        className="flex space-x-4 overflow-hidden pb-4 scroll-smooth"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-y", // allow vertical page scroll, block horizontal pan
        }}
      >
        {loading ? (
          <div className="min-w-[220px] flex-shrink-0">
            <div className="h-40 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        ) : displayed.length ? (
          displayed.slice(0, 6).map((item) => (
            <div key={item.id} className="min-w-[220px] max-w-[220px] flex-shrink-0">
              <Card item={item} />
            </div>
          ))
        ) : (
          <div className="min-w-[220px] flex-shrink-0">
            <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No items found.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardCarousel;
