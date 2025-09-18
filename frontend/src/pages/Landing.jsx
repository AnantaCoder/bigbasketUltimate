import CardCarousel from "../components/CardsCarousal";
import { NavigationBar } from "../components/NavigationBar";
import NewCardCarousel from "../components/NewCardCarousal";
import LandingPage from "./LandingPage";

const Landing = () => {
  return (
    <div>
      <NavigationBar />
      <CardCarousel title="My Smart Basket" />
      <NewCardCarousel title="Best Sellers" />
      <LandingPage />
    </div>
  );
};

export default Landing;

