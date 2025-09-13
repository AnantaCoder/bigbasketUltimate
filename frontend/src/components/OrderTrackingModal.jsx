import React from "react";

export default function OrderTrackingModal({ order, onClose }) {
  if (!order) return null;

  const statusSteps = [
    { status: "pending", label: "Order Placed", date: order.created_at },
    { status: "processing", label: "Processing", date: null },
    { status: "shipped", label: "Shipped", date: order.shipped_at },
    { status: "delivered", label: "Delivered", date: order.delivered_at },
  ];

  const getCurrentStep = () => {
    const index = statusSteps.findIndex((step) => step.status === order.status);
    return index >= 0 ? index : 0;
  };

  const currentStep = getCurrentStep();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Track Order #{order.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span className="font-semibold capitalize">{order.status}</span>
          </p>
          <p className="text-sm text-gray-600">Total: ₹{order.total_amount}</p>
          {order.tracking_number && (
            <p className="text-sm text-gray-600">
              Tracking Number: {order.tracking_number}
            </p>
          )}
          {order.estimated_delivery && (
            <p className="text-sm text-gray-600">
              Estimated Delivery:{" "}
              {new Date(order.estimated_delivery).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {statusSteps.map((step, index) => (
            <div key={step.status} className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  index <= currentStep ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div className="ml-4">
                <p
                  className={`font-semibold ${
                    index <= currentStep ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(step.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Order Items</h3>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.item_name} (x{item.quantity})
                </span>
                <span>₹{item.total_price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <p className="text-sm text-gray-600">
            {order.order_user.address}, {order.order_user.city},{" "}
            {order.order_user.state} - {order.order_user.pincode}
          </p>
        </div>
      </div>
    </div>
  );
}
