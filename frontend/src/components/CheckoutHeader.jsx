import { MapPin, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CheckoutHeader() {
    const navigate= useNavigate()
  return (
    <header className="bg-green-700 text-white px-80 py-4 flex items-center justify-between shadow-md">
           
      <div 
       onClick={() => navigate("/")}
      className="flex items-center gap-10 w-full">
        <div className="flex-shrink-0">
          <img
            src="/bigbasket-seeklogo.png"
            alt="BigBasket"
            className="h-15"
          />
        </div>

        <div className="flex flex-1 justify-center items-center space-x-10">
          <div className="flex items-center space-x-3">
            <MapPin className="w-7 h-7 text-white" />
            <div>
              <div className="font-semibold text-lg">Delivery Address</div>
              <div className="text-sm opacity-90">
                Select your delivery address or add a new one
              </div>
            </div>
          </div>

          <div className="border-l border-dotted border-white h-10"></div>

          <div className="flex items-center space-x-3">
            <CreditCard className="w-7 h-7 text-white" />
            <div>
              <div className="font-semibold text-lg">Payment Options</div>
              <div className="text-sm opacity-90">
                Pay order amount by selecting any payment mode
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
