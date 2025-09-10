import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <div className="space-y-6">
        {/* Support Info */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-2">Customer Support</h2>
          <div className="flex items-start space-x-4">
            <Phone className="w-5 h-5 text-emerald-500 mt-1" />
            <div>
              <p className="font-medium">Phone:</p>
              <p className="text-sm">1860-123-1000 (Toll-free)</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 mt-4">
            <Mail className="w-5 h-5 text-emerald-500 mt-1" />
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-sm">customerservice@bigbasket.com</p>
            </div>
          </div>
        </div>

        {/* Office Location (optional) */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-2">Head Office</h2>
          <div className="flex items-start space-x-4">
            <MapPin className="w-5 h-5 text-emerald-500 mt-1" />
            <p className="text-sm">
              Ranka Junction, 4th Floor, Old Madras Road, K R Puram, Bangalore, Karnataka – 560016
            </p>
          </div>
        </div>

        {/* Contact Form (optional) */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Your Name</label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Your Email</label>
              <input
                type="email"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Message</label>
              <textarea
                rows="4"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Write your message..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
