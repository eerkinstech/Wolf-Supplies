import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesPrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-700 to-black text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-100 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaLock className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-100 text-lg">Your Data Protection & Privacy Rights - GDPR Compliant</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 mb-4 leading-relaxed">
            Wolf Supplies LTD ("we", "our", or "us") is committed to protecting your personal data and privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information in accordance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Company Details:</strong> Wolf Supplies Ltd | Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline">16070029</a> | Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom
          </p>
          <p className="text-gray-700">
            <strong>Last Updated:</strong> January 19, 2026 | <strong>Effective Date:</strong> Immediately
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-gray-400 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Full name and contact information</li>
                <li>Email address and phone number</li>
                <li>Delivery and billing address</li>
                <li>Payment information (processed securely)</li>
              </ul>
            </div>

            <div className="border-l-4 border-gray-400 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Account Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Username and password</li>
                <li>Account preferences and wishlist</li>
                <li>Order history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Security</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>PCI-DSS Level 1 compliance for payment processing</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Data Rights (UK GDPR)</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Right to Access', desc: 'Request a copy of your personal data' },
              { title: 'Right to Rectification', desc: 'Correct inaccurate information' },
              { title: 'Right to Erasure', desc: 'Request deletion of your data' },
              { title: 'Right to Portability', desc: 'Export your data to another provider' }
            ].map((right, idx) => (
              <div key={idx} className="border-l-4 border-gray-400 pl-4">
                <h4 className="font-bold text-gray-900 mb-1">{right.title}</h4>
                <p className="text-sm text-gray-700">{right.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-lg border-2 border-gray-400 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Questions?</h2>
          <p className="text-gray-700 mb-4">
            Contact our Data Protection Officer:
          </p>
          <div className="space-y-2 text-gray-700">
            <p><FaEnvelope className="inline mr-2 text-gray-400" /> Email: <a href="mailto:privacy@wolfsuppliesltd.co.uk" className="text-gray-400 hover:underline">privacy@wolfsuppliesltd.co.uk</a></p>
            <p><FaPhone className="inline mr-2 text-gray-400" /> Phone: <a href="tel:+447398998101" className="text-gray-400 hover:underline">+44 7398 998101</a></p>
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

export default PoliciesPrivacyPage;
