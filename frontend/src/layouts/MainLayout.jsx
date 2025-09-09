import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="min-h-screen ">
        <Navbar/>
        <main className="lg:pl-50 lg:pr-50 sm:pr-10 sm:pr-10" >
            <Outlet />
        </main>  
    <Footer />
    </div>
  );
}

export default MainLayout;