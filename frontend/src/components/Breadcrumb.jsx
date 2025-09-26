import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House } from "lucide-react";
/**
 * Universal Breadcrumb
 * - If a `category` prop is passed, it uses the category hierarchy.
 * - If `categoryId` and `categories` are passed, builds hierarchy from flat list.
 * - If `productName` is passed, appends it at the end.
 * - Otherwise, it falls back to the URL path.
 */
const Breadcrumb = ({ category, categoryId, categories, productName }) => {
  const location = useLocation();

  // -------- Utility to build chain from flat categories list --------
  const buildChainFromId = (categoryId, categories) => {
    const findCategory = (id) => categories.find((c) => c.id === id);
    let current = findCategory(categoryId);
    if (!current) return [];

    const chain = [];
    while (current) {
      chain.unshift({ ...current, route: `/category/${current.id}` });
      const parentId = current.parent?.id || current.parent_id;
      current = parentId ? findCategory(parentId) : null;
    }
    return chain;
  };

  // -------- Category-based breadcrumbs --------
  const buildCategoryBreadcrumbs = (cat) => {
    // Recursively build the parent chain
    if (!cat?.parent) return [{ ...cat, route: `/category/${cat.id}` }];
    return [
      ...buildCategoryBreadcrumbs(cat.parent),
      { ...cat, route: `/category/${cat.id}` },
    ];
  };

  let breadcrumbs = [];

  if (category) {
    breadcrumbs = buildCategoryBreadcrumbs(category);
  } else if (categoryId && categories.length > 0) {
    breadcrumbs = buildChainFromId(categoryId, categories);
  } else {
    // -------- URL-based breadcrumbs --------
    const pathnames = location.pathname.split("/").filter((x) => x);

    const urlBreadcrumbs = pathnames.map((name, index) => {
      const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
      // Clean up the name by replacing hyphens with spaces
      const cleanName = name.replace(/-/g, " ");
      return { id: routeTo, name: cleanName, route: routeTo };
    });
    breadcrumbs = urlBreadcrumbs;
  }

  // Append product name if provided
  if (productName) {
    breadcrumbs = [
      ...breadcrumbs,
      { name: productName, id: `product-${Date.now()}`, route: null },
    ];
  }

  return (
    <nav aria-label="breadcrumb" className="text-sm text-gray-600 mb-4">
      <ol className="flex space-x-2">
        {/* Always show home link */}
        <li>
          <Link to="/" className="hover:text-emerald-600">
            <House />
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.id} className="flex items-center">
              <span className="mx-2">›</span>
              {isLast ? (
                <span className="text-gray-500 font-medium capitalize">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={crumb.route}
                  className="hover:text-emerald-600 capitalize"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
