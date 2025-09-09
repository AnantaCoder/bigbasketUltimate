import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddItems from "./features/sore/AddItems";
import CartPage from "./features/Cart";




function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/seller/add-items" element={<AddItems />} />
          <Route path="/cart" element={<CartPage />} />


        </Route>
        


        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;