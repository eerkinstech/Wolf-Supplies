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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      {/* Header Section */}
      <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }} >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 w-fit transition duration-300">
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
          <div className="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}  >
            <FaPhone className="text-4xl mx-auto mb-4" style={{ color: 'var(--color-accent-primary, #a5632a)' }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Call Us</h3>
            <p className="mb-2" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>
              <a href="tel:+447398998101" className="hover:opacity-75 transition duration-300" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>
                +44 7398 998101
              </a>
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>

          <div className="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}  >
            <FaEnvelope className="text-4xl mx-auto mb-4" style={{ color: 'var(--color-accent-primary, #a5632a)' }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Email Us</h3>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
              <a href="mailto:support@wolfsuppliesltd.co.uk" className="hover:opacity-75 transition duration-300" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>
                support@wolfsuppliesltd.co.uk
              </a>
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>We'll respond within 24 hours</p>
          </div>

          <div className="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}  >
            <FaMapMarkerAlt className="text-4xl mx-auto mb-4" style={{ color: 'var(--color-accent-primary, #a5632a)' }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Visit Us</h3>
            <p className="mb-2 font-semibold" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Unit 4 Atlas Estates</p>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Colebrook Road, Birmingham</p>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>West Midlands, B11 2NT</p>
            <p className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>United Kingdom</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
              <FaPaperPlane style={{ color: 'var(--color-accent-primary, #a5632a)' }} />
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 resize-none"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
              >
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>

          {/* FAQ & Support Info */}
          <div className="space-y-8">
            {/* Support Hours */}
            <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
                <FaClock style={{ color: 'var(--color-accent-primary, #a5632a)' }} />
                Support Hours
              </h2>
              <div className="space-y-4">
                <div className="pl-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)', backgroundColor: 'rgba(165, 99, 42, 0.1)' }}>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>Monday - Friday</p>
                  <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>9:00 AM - 6:00 PM GMT</p>
                </div>
                <div className="pl-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)', backgroundColor: 'rgba(165, 99, 42, 0.1)' }}>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>Saturday - Sunday</p>
                  <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>10:00 AM - 4:00 PM GMT</p>
                </div>
                <div className="pl-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)', backgroundColor: 'rgba(165, 99, 42, 0.1)' }}>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>Bank Holidays</p>
                  <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Closed</p>
                </div>
              </div>
            </div>

            {/* Quick Support */}
            <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
                <FaHeadset style={{ color: 'var(--color-accent-primary, #a5632a)' }} />
                Quick Support
              </h2>
              <div className="space-y-3">
                <Link
                  to="/policies/shipping"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  📦 Shipping Policy
                </Link>
                <Link
                  to="/policies/returns-refund"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  🔄 Returns & Refunds
                </Link>
                <Link
                  to="/policies/privacy"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  🔒 Privacy Policy
                </Link>
                <Link
                  to="/policies/faq"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
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
