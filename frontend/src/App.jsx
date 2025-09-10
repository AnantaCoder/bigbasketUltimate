import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import AddItems from "./features/sore/AddItems";
import CartPage from "./features/Cart";
import ProductDetail from "./components/ProductDetail";
import MyOrders from "./pages/MyOrders";
import ActiveOrders from "./pages/ActiveOrders";
import PastOrders from "./pages/PastOrders";
import ContactUs from "./pages/ContactUs";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import SmartBasket from "./pages/SmartBasket";
import ShoppingList from "./pages/ShoppingList";
import Addresses from "./pages/Addresses";
import SavedPayments from "./pages/SavedPayments";
import SellerAuthPage from "./pages/SellerLoginPage";
import ManageItems from "./pages/ManageItems";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
        <Route index element={<Landing />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/seller/add-items" element={<AddItems />} />
          <Route path="/seller/manage-items" element={<ManageItems />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Orders */}
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-orders/active" element={<ActiveOrders />} />
          <Route path="/my-orders/past" element={<PastOrders />} />
          <Route path="/customer-service" element={<ContactUs />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/smart-basket" element={<SmartBasket />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/saved-payments" element={<SavedPayments />} />
        </Route>

          <Route path="/seller" element={<SellerAuthPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
