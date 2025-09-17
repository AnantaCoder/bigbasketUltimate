import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House } from "lucide-react";
/**
 * Universal Breadcrumb
 * - If a `category` prop is passed, it uses the category hierarchy.
 * - Otherwise, it falls back to the URL path.
 */
const Breadcrumb = ({ category }) => {
  const location = useLocation();

  // -------- Category-based breadcrumbs --------
  const buildCategoryBreadcrumbs = (cat) => {
    // Recursively build the parent chain
    if (!cat?.parent) return [{ ...cat, route: `/category/${cat.id}` }];
    return [
      ...buildCategoryBreadcrumbs(cat.parent),
      { ...cat, route: `/category/${cat.id}` },
    ];
  };

  const categoryBreadcrumbs = category
    ? buildCategoryBreadcrumbs(category)
    : [];

  // -------- URL-based breadcrumbs --------
  const pathnames = location.pathname.split("/").filter((x) => x);

  const urlBreadcrumbs = pathnames.map((name, index) => {
    const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
    // Clean up the name by replacing hyphens with spaces
    const cleanName = name.replace(/-/g, " ");
    return { id: routeTo, name: cleanName, route: routeTo };
  });

  // -------- Final breadcrumbs --------
  // Choose which breadcrumbs to use based on the 'category' prop
  const breadcrumbs = category ? categoryBreadcrumbs : urlBreadcrumbs;

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
