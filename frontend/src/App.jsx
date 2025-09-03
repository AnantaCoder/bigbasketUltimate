import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";




function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} /> 
          <Route path="/home" element={<HomePage />} />


        </Route>
        


        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;