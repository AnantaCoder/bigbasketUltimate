import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AddItems from "./features/sore/AddItems";
import CartPage from "./features/Cart";




function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} /> 
          <Route path="/home" element={<HomePage />} />
          <Route path="/seller/add-items" element={<AddItems />} />
          <Route path="/cart" element={<CartPage />} />


        </Route>
        


        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;