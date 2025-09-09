import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { title: "Edit Profile", path: "/profile" },
    { title: "Delivery Addresses", path: "/addresses" },
    { title: "Email Addresses", path: "/emails" },
  ];

  const ordersMenu = [
    { title: "Smart Basket", path: "/smart-basket" },
    { title: "Past Orders", path: "/my-orders/past" },
  ];

  const accountMenu = [
    { title: "My Orders", path: "/my-orders" },
    { title: "Customer Service", path: "/customer-service" },
    { title: "My Wallet", path: "/wallet" },
    { title: "My Gift Cards", path: "/gift-cards" },
  ];

  const renderMenu = (items) =>
    items.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className={
          "block py-2 px-4 rounded " +
          (location.pathname === item.path
            ? "bg-green-100 text-green-600 font-semibold"
            : "hover:bg-gray-100")
        }
      >
        {item.title}
      </Link>
    ));

  return (
    <div className="w-64 border-r min-h-screen bg-white">
      <div className="p-4">
        <h2 className="font-bold text-gray-700">PERSONAL DETAILS</h2>
        {renderMenu(menu)}

        <h2 className="mt-6 font-bold text-gray-700">SHOP FROM</h2>
        {renderMenu(ordersMenu)}

        <h2 className="mt-6 font-bold text-gray-700">MY ACCOUNT</h2>
        {renderMenu(accountMenu)}
      </div>
    </div>
  );
}
