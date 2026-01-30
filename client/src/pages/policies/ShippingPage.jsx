import React from 'react';
import { Link } from 'react-router-dom';
import useMetaTags from '../../hooks/useMetaTags';
import { FaTruck, FaClock, FaGlobeEurope, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesShippingPage = () => {
  // Set up meta tags for SEO
  useMetaTags({
    title: 'Shipping Policy | Fast & Reliable UK Delivery',
    description: 'Wolf Supplies LTD Shipping Policy - Fast delivery, tracking information, and reliable service across the UK.',
    keywords: 'shipping, delivery, policy, UK, fast delivery, tracking',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      {/* Header Section */}
      <div className="bg-[var(--color-accent-primary)] text-white py-8 md:py-12">
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
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaClock className="text-[var(--color-accent-primary)] text-2xl" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Delivery Timeframe</h2>
          </div>
          <p className="text-[var(--color-text-light)] mb-4 leading-relaxed">
            At Wolf Supplies LTD, we are committed to delivering your orders promptly and safely. All orders placed on our UK-based store are processed and shipped within <span className="font-bold text-[var(--color-accent-primary)]">2-4 business days</span>.
          </p>
          <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded mb-4">
            <p className="text-[var(--color-text-light)]">
              <strong>Business Days Definition:</strong> Monday to Friday, excluding UK public holidays and weekends.
            </p>
          </div>
          <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded mb-4">
            <p className="text-[var(--color-text-primary)] font-semibold">Free Shipping on all UK orders  — no minimum spend</p>
          </div>
          <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded text-sm">
            <p className="text-[var(--color-text-light)]"><strong>Wolf Supplies Ltd | Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">16070029</a></strong></p>
            <p className="text-[var(--color-text-light)]">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Shipping Methods & Costs</h2>
          
          <div className="space-y-6">
            {/* Standard Shipping */}
            <div className="border-l-4 border-[var(--color-accent-primary)] pl-6 pb-6 border-b">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Standard Delivery</h3>
              <ul className="text-[var(--color-text-light)] space-y-2">
                <li>📍 <strong>Coverage:</strong> All UK postcodes (England, Scotland, Wales, Northern Ireland)</li>
                <li>⏱️ <strong>Delivery Time:</strong> 2-4 business days from order confirmation</li>
                <li>💷 <strong>Cost:</strong> FREE for all UK orders</li>
                <li>📦 <strong>Tracking:</strong> Real-time order tracking available</li>
              </ul>
            </div>

            {/* International */}
            <div className="border-l-4 border-[var(--color-accent-primary)] pl-6">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">International Shipping</h3>
              <ul className="text-[var(--color-text-light)] space-y-2">
                <li>🌍 <strong>International Orders:</strong> We ship worldwide! However, due to varying customs and regulations, we recommend contacting us before placing an international order.</li>
                <li>📧 <strong>Contact Us:</strong> Please <Link to="/contact" className="text-[var(--color-accent-primary)] hover:underline font-semibold">contact our team</Link> for international shipping inquiries, custom quotes, and delivery timelines.</li>
                <li>💷 <strong>Cost:</strong> Shipping costs vary based on destination and will be confirmed via email after your inquiry.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Postcode Coverage */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Postcode Coverage</h2>
          <p className="text-[var(--color-text-light)] mb-4">
            We deliver to all UK postcodes including:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['England', 'Scotland', 'Wales', 'Northern Ireland', 'London', 'Manchester', 'Birmingham', 'Leeds'].map((region, idx) => (
              <div key={idx} className="bg-[var(--color-bg-section)] p-3 rounded-lg border border-[var(--color-border-light)] text-center">
                <p className="font-semibold text-[var(--color-text-primary)]">{region}</p>
              </div>
            ))}
          </div>
          <p className="text-[var(--color-text-light)] mt-4">
            <strong>Remote Areas:</strong> The Highlands, Islands, and other remote postcode areas may take an additional 1-2 business days.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-[var(--color-bg-section)] rounded-lg border-2 border-[var(--color-border-light)] p-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Questions About Shipping?</h2>
          <p className="text-[var(--color-text-light)] mb-4">
            Our customer support team is here to help. Contact us at:
          </p>
          <div className="space-y-2 text-[var(--color-text-light)]">
            <p><FaEnvelope className="inline mr-2 text-[var(--color-accent-primary)]" /> Email: <a href="mailto:support@wolfsuppliesltd.co.uk" className="text-[var(--color-accent-primary)] hover:underline">support@wolfsuppliesltd.co.uk</a></p>
            <p><FaPhone className="inline mr-2 text-[var(--color-accent-primary)]" /> Phone: <a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline">+44 7398 998101</a></p>
            <p>⏰ Hours: Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-[var(--color-text-light)] text-sm mt-8">
          Last updated: January 19, 2026 | Wolf Supplies LTD
        </p>
      </div>
    </div>
  );
};

export default PoliciesShippingPage;
