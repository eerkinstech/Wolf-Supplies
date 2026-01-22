import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaClock, FaHeadset } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/forms/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to send message');
        return;
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-6 hover:text-gray-100 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white">We're Here to Help - Get in Touch</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
            <FaPhone className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Call Us</h3>
            <p className="text-gray-700 mb-2">
              <a href="tel:+447398998101" className="hover:text-gray-400 transition">
                +44 7398 998101
              </a>
            </p>
            <p className="text-sm text-gray-600">Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
            <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Us</h3>
            <p className="text-gray-700 mb-2">
              <a href="mailto:support@wolfsuppliesltd.co.uk" className="hover:text-gray-400 transition">
                support@wolfsuppliesltd.co.uk
              </a>
            </p>
            <p className="text-sm text-gray-600">We'll respond within 24 hours</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
            <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Visit Us</h3>
            <p className="text-gray-700 mb-2 font-semibold">Unit 4 Atlas Estates</p>
            <p className="text-gray-700 mb-2">Colebrook Road, Birmingham</p>
            <p className="text-gray-700 mb-2">West Midlands, B11 2NT</p>
            <p className="text-sm text-gray-600">United Kingdom</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FaPaperPlane className="text-gray-400" />
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition duration-300"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition duration-300"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition duration-300"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition duration-300 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>

          {/* FAQ & Support Info */}
          <div className="space-y-8">
            {/* Support Hours */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaClock className="text-gray-400" />
                Support Hours
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-gray-400 pl-4">
                  <p className="font-bold text-gray-900">Monday - Friday</p>
                  <p className="text-gray-700">9:00 AM - 6:00 PM GMT</p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4">
                  <p className="font-bold text-gray-900">Saturday - Sunday</p>
                  <p className="text-gray-700">10:00 AM - 4:00 PM GMT</p>
                </div>
                <div className="border-l-4 border-gray-300 pl-4 bg-gray-50 p-4 rounded">
                  <p className="font-bold text-gray-900">Bank Holidays</p>
                  <p className="text-gray-700">Closed</p>
                </div>
              </div>
            </div>

            {/* Quick Support */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaHeadset className="text-gray-400" />
                Quick Support
              </h2>
              <div className="space-y-3">
                <Link
                  to="/policies/shipping"
                  className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition duration-300 text-gray-400 font-semibold hover:text-gray-700"
                >
                  📦 Shipping Policy
                </Link>
                <Link
                  to="/policies/returns-refund"
                  className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition duration-300 text-gray-400 font-semibold hover:text-gray-700"
                >
                  🔄 Returns & Refunds
                </Link>
                <Link
                  to="/policies/privacy"
                  className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition duration-300 text-gray-400 font-semibold hover:text-gray-700"
                >
                  🔒 Privacy Policy
                </Link>
                <Link
                  to="/policies/faq"
                  className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition duration-300 text-gray-400 font-semibold hover:text-gray-700"
                >
                  ❓ FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
