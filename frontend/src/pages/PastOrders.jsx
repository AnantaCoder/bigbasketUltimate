import Sidebar from "../components/Sidebar";

export default function PastOrders() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-xl font-bold">Past Orders</h1>
        <p className="text-gray-500">You haven’t placed any orders yet.</p>
      </div>
    </div>
  );
}
