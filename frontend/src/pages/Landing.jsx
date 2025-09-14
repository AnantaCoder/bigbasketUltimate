import CardCarousel from "../components/CardsCarousal";
import { NavigationBar } from "../components/NavigationBar";
import LandingPage from "./LandingPage";

const Landing = () => {
  return (
    <div>
      <NavigationBar />
      <CardCarousel title="New Arrivals" />
      <CardCarousel title="Best Sellers" />
      <LandingPage />
    </div>
  );
};

export default Landing;

