import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiDiscover, SiApplepay, SiGooglepay } from 'react-icons/si';
import wolfLogo from '../../assets/Wolf Supplies LTD.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-black mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <img src={wolfLogo} alt="Wolf Supplies LTD" className="h-auto w-auto object-cover" />
            </h3>
            <p className="text-gray-700 mb-4">Wolf Supplies LTD is a company registered in the United Kingdom. Your trusted UK online shopping destination for quality products at competitive prices.</p>
            <p className="text-gray-900 text-sm mb-2"><strong>Company Number:</strong> <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">16070029</a></p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-700 hover:text-black transition duration-300">
                <FaFacebook className="text-lg text-black" />
              </a>
              <a href="#" className="text-gray-700 hover:text-black transition duration-300">
                <FaTwitter className="text-lg text-black" />
              </a>
              <a href="#" className="text-gray-700 hover:text-black transition duration-300">
                <FaInstagram className="text-lg text-black" />
              </a>
              <a href="#" className="text-gray-700 hover:text-black transition duration-300">
                <FaLinkedin className="text-lg text-black" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-700 hover:text-black transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-700 hover:text-black transition duration-300">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-700 hover:text-black transition duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-700 hover:text-black transition duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Information */}
          <div>
            <h4 className="text-lg font-bold mb-4">Policies & Info</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/policies/shipping" className="text-gray-700 hover:text-black transition duration-300">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/returns-refund" className="text-gray-700 hover:text-black transition duration-300">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="text-gray-700 hover:text-black transition duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="text-gray-700 hover:text-black transition duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/policies/faq" className="text-gray-700 hover:text-black transition duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-700">
                <FaPhone className="text-black" />
                <a href="tel:+447398998101" className="hover:text-black">+44 7398 998101</a>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <FaEnvelope className="text-black" />
                <a href="mailto:support@wolfsuppliesltd.co.uk" className="hover:text-black">support@WolfSuppliesLTD.co.uk</a>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-black mt-1" />
                <div>
                  <p>Unit 4 Atlas Estates</p>
                  <p>Colebrook Road, Birmingham</p>
                  <p>West Midlands, B11 2NT</p>
                  <p>United Kingdom</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <FaGlobe className="text-black" />
                <a href='https://wolfsuppliesltd.co.uk' className="hover:text-black">wolfsuppliesltd.co.uk</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="border-t border-gray-300 py-8 mb-8">
          <h4 className="text-lg font-bold mb-6 text-center">We Accept</h4>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2" title="Visa">
              <SiVisa className="text-2xl text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Visa</span>
            </div>
            <div className="flex items-center gap-2" title="Mastercard">
              <SiMastercard className="text-2xl text-red-600" />
              <span className="text-sm font-semibold text-gray-700">Mastercard</span>
            </div>
            <div className="flex items-center gap-2" title="Discover">
              <SiDiscover className="text-2xl text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">Discover</span>
            </div>
            <div className="flex items-center gap-2" title="Apple Pay">
              <SiApplepay className="text-2xl text-black" />
              <span className="text-sm font-semibold text-gray-700">Apple Pay</span>
            </div>
            <div className="flex items-center gap-2" title="Google Pay">
              <SiGooglepay className="text-2xl text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Google Pay</span>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/payment-options" className="text-blue-600 hover:text-blue-800 transition duration-300 text-sm font-semibold">
              View All Payment Options
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-700">
              &copy; {currentYear} Wolf Supplies LTD. All rights reserved. Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">16070029</a>
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link to="/policies/privacy" className="text-gray-700 hover:text-black transition duration-300 text-sm">
                Privacy Policy
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/policies/terms" className="text-gray-700 hover:text-black transition duration-300 text-sm">
                Terms of Service
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/policies/shipping" className="text-gray-700 hover:text-black transition duration-300 text-sm">
                Shipping Policy
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/policies/returns-refund" className="text-gray-700 hover:text-black transition duration-300 text-sm">
                Returns & Refunds
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/policies/faq" className="text-gray-700 hover:text-black transition duration-300 text-sm">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
