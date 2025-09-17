import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-[150vh] mx-auto px-4 sm:px-6 lg:px-8">
         {/* <Breadcrumb /> */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
