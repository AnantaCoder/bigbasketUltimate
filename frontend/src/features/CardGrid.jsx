import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import Card from "../components/Card";
import { fetchItems } from "../app/slices/itemsSlice";

const PAGE_SIZE = 10;

/**
 * A single skeleton card component to represent a loading item.
 */
const SkeletonCard = () => (
  <div className="border bg-white border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
    {/* Image placeholder */}
    <div className="h-40 bg-gray-300 rounded-md mb-4"></div>
    {/* Text placeholders */}
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);


/**
 * A grid of skeleton cards.
 */
const SkeletonGrid = ({ count = PAGE_SIZE }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const CardGrid = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const sentinelRef = useRef(null);
  const observer = useRef(null);

  const loadPage = useCallback(
    async (nextPage = 1) => {
      try {
        if (nextPage === 1) {
          setLoadingInitial(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const res = await dispatch(fetchItems({ page: nextPage, pageSize: PAGE_SIZE })).unwrap();

        if (nextPage === 1) {
          setItems(res.results || []);
        } else {
          setItems((prev) => [...prev, ...(res.results || [])]);
        }

        setHasNext(Boolean(res.next));
        setPage(nextPage);
      } catch (err) {
        setError(err?.message || JSON.stringify(err) || "Failed to load items");
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNext && !loadingMore && !loadingInitial) {
            loadPage(page + 1);
          }
        });
      },
      { root: null, rootMargin: "400px", threshold: 0.1 }
    );

    observer.current.observe(sentinelRef.current);

    return () => {
      if (observer.current && sentinelRef.current) {
        // A check to ensure sentinelRef.current exists before unobserving
        observer.current.unobserve(sentinelRef.current);
      }
      observer.current = null;
    };
  }, [sentinelRef, hasNext, loadingMore, loadingInitial, loadPage, page]);

  if (loadingInitial) {
    return (
      <section className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Items</h2>
        </div>
        <SkeletonGrid count={PAGE_SIZE} />
      </section>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error: {typeof error === "string" ? error : JSON.stringify(error)}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <img src="https://placehold.co/448x250/FFFFFF/CCCCCC?text=No+Items" alt="No items found" className="max-w-md w-full object-contain mb-6 rounded-lg" />
        <p className="text-gray-500 text-lg md:text-xl font-medium">No items found.</p>
        <button
          onClick={() => {
            setPage(1);
            setHasNext(true);
            loadPage(1);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Reload Items
        </button>
      </div>
    );
  }

  return (
    <section className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Items</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">{items.length} items</div>
          {/* <button
            onClick={() => {
              setPage(1);
              setHasNext(true);
              loadPage(1);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center">
        {/* Updated to show 3 skeletons when loading more */}
        {loadingMore && <SkeletonGrid count={3} />}
        {!hasNext && <div className="text-sm text-gray-500 mt-4">No more items.</div>}
        <div ref={sentinelRef} style={{ width: "100%", height: 1 }} />
      </div>
    </section>
  );
};

export default CardGrid;
