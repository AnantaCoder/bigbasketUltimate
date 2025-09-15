import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ category }) => {
  if (!category) return null;

  // Recursive function to build breadcrumb trail
  const buildBreadcrumbs = (cat) => {
    if (!cat.parent) {
      return [cat];
    }
    return [...buildBreadcrumbs(cat.parent), cat];
  };

  const breadcrumbs = buildBreadcrumbs(category);

  return (
    <nav className="breadcrumb text-sm text-gray-600 mb-4">
      {breadcrumbs.map((cat, index) => (
        <span key={cat.id}>
          <Link
            to={`/category/${cat.id}`}
            className="hover:text-emerald-600 cursor-pointer"
          >
            {cat.name}
          </Link>
          {index < breadcrumbs.length - 1 && " > "}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
