import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MyOrders() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        <div className="space-y-4">
          <Link
            to="/my-orders/active"
            className="block p-4 border rounded-lg shadow hover:bg-gray-50"
          >
            View Active Orders
          </Link>
          <Link
            to="/my-orders/past"
            className="block p-4 border rounded-lg shadow hover:bg-gray-50"
          >
            View Past Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
