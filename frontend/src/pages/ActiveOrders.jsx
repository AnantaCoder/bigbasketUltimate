import Sidebar from "../components/Sidebar";

export default function ActiveOrders() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-xl font-bold">Active Orders</h1>
        <p className="text-gray-500">No active orders at the moment.</p>
      </div>
    </div>
  );
}
