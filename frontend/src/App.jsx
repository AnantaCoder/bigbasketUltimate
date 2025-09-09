import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import AddItems from "./features/sore/AddItems";
import CartPage from "./features/Cart";
import ProductDetail from "./components/ProductDetail";
import MyOrders from "./pages/MyOrders";
import ActiveOrders from "./pages/ActiveOrders";
import PastOrders from "./pages/PastOrders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/seller/add-items" element={<AddItems />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Orders */}
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-orders/active" element={<ActiveOrders />} />
          <Route path="/my-orders/past" element={<PastOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
