import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileContract, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesTermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-100 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaFileContract className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-gray-100 text-lg">Legal Agreement Between Wolf Supplies LTD and Users</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Acceptance */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing and using this website (wolfsuppliesltd.co.uk), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded mb-4">
            <p className="text-gray-800 mb-2">
              These Terms of Service constitute a binding legal agreement between Wolf Supplies LTD and you, the user.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Company Number:</strong> <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline">16070029</a> | <strong>Address:</strong> Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom
            </p>
          </div>
        </div>

        {/* User Accounts */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Accounts</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              When you create an account on Wolf Supplies, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate, current, and complete account information</li>
              <li>Maintain confidentiality of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> Users must be at least 18 years old to create an account and make purchases.
            </p>
          </div>
        </div>

        {/* Orders & Purchases */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders & Purchases</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Order Confirmation:</strong> Placement of an order represents an offer to purchase. We reserve the right to accept or reject any order.
            </p>
            <p>
              <strong>Payment:</strong> Payment must be received before items are dispatched. We accept various payment methods and process payments securely.
            </p>
            <p>
              <strong>Right of Withdrawal:</strong> Under UK Consumer Rights Act 2015, you have 14 days to cancel your order from the date of delivery (30 days for returns).
            </p>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>No Warranties:</strong> The materials on Wolf Supplies LTD are provided on an 'as is' basis. Wolf Supplies LTD makes no warranties, expressed or implied.
            </p>
            <p>
              <strong>Maximum Liability:</strong> Wolf Supplies LTD's total liability shall not exceed the amount paid for the specific product or service in question.
            </p>
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dispute Resolution</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Governing Law:</strong> These Terms shall be governed by the laws of England and Wales.
            </p>
            <p>
              <strong>Jurisdiction:</strong> You agree to submit to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-lg border-2 border-gray-400 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Terms?</h2>
          <p className="text-gray-700 mb-4">
            For questions regarding these Terms of Service, please contact:
          </p>
          <div className="space-y-2 text-gray-700">
            <p><FaEnvelope className="inline mr-2 text-gray-400" /> Email: <a href="mailto:legal@wolfsuppliesltd.co.uk" className="text-gray-400 hover:underline">legal@wolfsuppliesltd.co.uk</a></p>
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

export default PoliciesTermsPage;
