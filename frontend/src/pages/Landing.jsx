import CardCarousal from '../components/CardsCarousal';
import { NavigationBar } from '../components/NavigationBar';
import LandingPage from './LandingPage';

const Landing = () => {
  return (
    <div >
      <NavigationBar/>
      <CardCarousal/>
      <LandingPage />
    </div>
  );
};

export default Landing;
