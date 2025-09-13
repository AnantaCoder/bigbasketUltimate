import { Routes, Route } from "react-router-dom";
import Orders from "./components/Orders";

const SellerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Orders />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
};

export default SellerRoutes;
