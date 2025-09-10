import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import {
  MapPin,
  Search,
  Star,
  Clock,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Discover NearbyGo
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your ultimate companion for exploring local businesses, services, and experiences.
            Find what you need, right where you are.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/home"
              sx={{
                backgroundColor: 'white',
                color: 'blue.600',
                '&:hover': { backgroundColor: 'gray.100' },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { backgroundColor: 'white', color: 'blue.600' },
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose NearbyGo?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Local Discovery</h3>
              <p className="text-gray-600">
                Discover hidden gems and local favorites in your neighborhood.
              </p>
            </div>
            <div className="text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find exactly what you're looking for with our intelligent search.
              </p>
            </div>
            <div className="text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-2">Trusted Reviews</h3>
              <p className="text-gray-600">
                Read authentic reviews from real users to make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search</h3>
              <p className="text-gray-600">
                Enter your location and what you're looking for.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Discover</h3>
              <p className="text-gray-600">
                Browse through curated results tailored to your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Connect</h3>
              <p className="text-gray-600">
                Connect with businesses and enjoy local experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">
                Get instant updates on local events and offers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600 text-sm">
                All businesses are verified for your safety.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600 text-sm">
                Powered by local community recommendations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-lg font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600 text-sm">
                Tailored recommendations based on your preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl mb-8">
            Join thousands of users discovering their local communities.
          </p>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/home"
            sx={{
              backgroundColor: 'white',
              color: 'blue.600',
              '&:hover': { backgroundColor: 'gray.100' },
            }}
          >
            Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">NearbyGo</h3>
              <p className="text-gray-400">
                Your gateway to local discovery and community connections.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/home" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Local Search</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Business Listings</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 NearbyGo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
