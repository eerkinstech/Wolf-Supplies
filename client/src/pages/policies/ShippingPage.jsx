import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaClock, FaGlobeEurope, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesShippingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-200 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaTruck className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Shipping Policy</h1>
          </div>
          <p className="text-gray-100 text-lg">Wolf Supplies LTD - Fast & Reliable Delivery</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaClock className="text-gray-400 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900">Delivery Timeframe</h2>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            At Wolf Supplies LTD, we are committed to delivering your orders promptly and safely. All orders placed on our UK-based store are processed and shipped within <span className="font-bold text-gray-400">2-4 business days</span>.
          </p>
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded mb-4">
            <p className="text-gray-800">
              <strong>Business Days Definition:</strong> Monday to Friday, excluding UK public holidays and weekends.
            </p>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-700 p-4 rounded mb-4">
            <p className="text-gray-800 font-semibold">Free Shipping on all UK orders  — no minimum spend</p>
          </div>
          <div className="bg-gray-50 border-l-4 border-gray-600 p-4 rounded text-sm">
            <p className="text-gray-700"><strong>Wolf Supplies Ltd | Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">16070029</a></strong></p>
            <p className="text-gray-700">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Methods & Costs</h2>
          
          <div className="space-y-6">
            {/* Standard Shipping */}
            <div className="border-l-4 border-gray-400 pl-6 pb-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Delivery</h3>
              <ul className="text-gray-700 space-y-2">
                <li>📍 <strong>Coverage:</strong> All UK postcodes (England, Scotland, Wales, Northern Ireland)</li>
                <li>⏱️ <strong>Delivery Time:</strong> 2-4 business days from order confirmation</li>
                <li>💷 <strong>Cost:</strong> FREE for all UK orders</li>
                <li>📦 <strong>Tracking:</strong> Real-time order tracking available</li>
              </ul>
            </div>

            {/* International */}
            <div className="border-l-4 border-gray-400 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">International Shipping</h3>
              <ul className="text-gray-700 space-y-2">
                <li>🌍 <strong>International Orders:</strong> We ship worldwide! However, due to varying customs and regulations, we recommend contacting us before placing an international order.</li>
                <li>📧 <strong>Contact Us:</strong> Please <Link to="/contact" className="text-gray-600 hover:underline font-semibold">contact our team</Link> for international shipping inquiries, custom quotes, and delivery timelines.</li>
                <li>💷 <strong>Cost:</strong> Shipping costs vary based on destination and will be confirmed via email after your inquiry.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Postcode Coverage */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Postcode Coverage</h2>
          <p className="text-gray-700 mb-4">
            We deliver to all UK postcodes including:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['England', 'Scotland', 'Wales', 'Northern Ireland', 'London', 'Manchester', 'Birmingham', 'Leeds'].map((region, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded-lg border border-gray-300 text-center">
                <p className="font-semibold text-gray-900">{region}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 mt-4">
            <strong>Remote Areas:</strong> The Highlands, Islands, and other remote postcode areas may take an additional 1-2 business days.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gray-100 rounded-lg border-2 border-gray-400 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Shipping?</h2>
          <p className="text-gray-700 mb-4">
            Our customer support team is here to help. Contact us at:
          </p>
          <div className="space-y-2 text-gray-700">
            <p><FaEnvelope className="inline mr-2 text-gray-600" /> Email: <a href="mailto:support@wolfsuppliesltd.co.uk" className="text-gray-600 hover:underline">support@wolfsuppliesltd.co.uk</a></p>
            <p><FaPhone className="inline mr-2 text-gray-400" /> Phone: <a href="tel:+447398998101" className="text-gray-400 hover:underline">+44 7398 998101</a></p>
            <p>⏰ Hours: Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-gray-900 text-sm mt-8">
          Last updated: January 19, 2026 | Wolf Supplies LTD
        </p>
      </div>
    </div>
  );
};

export default PoliciesShippingPage;
