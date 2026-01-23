import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileContract, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesTermsPage = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      {/* Header Section */}
      <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 w-fit transition duration-300">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaFileContract className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-white text-lg">Legal Agreement Between Wolf Supplies LTD and Users</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Acceptance */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Acceptance of Terms</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            By accessing and using this website (wolfsuppliesltd.co.uk), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
          <div className="p-4 rounded mb-4" style={{ backgroundColor: 'rgba(165, 99, 42, 0.1)', borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
            <p className="mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
              These Terms of Service constitute a binding legal agreement between Wolf Supplies LTD and you, the user.
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
              <strong>Company Number:</strong> <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>16070029</a> | <strong>Address:</strong> Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom
            </p>
          </div>
        </div>

        {/* User Accounts */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>User Accounts</h2>
          
          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
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
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Orders & Purchases</h2>
          
          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
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
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Limitation of Liability</h2>
          
          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              <strong>No Warranties:</strong> The materials on Wolf Supplies LTD are provided on an 'as is' basis. Wolf Supplies LTD makes no warranties, expressed or implied.
            </p>
            <p>
              <strong>Maximum Liability:</strong> Wolf Supplies LTD's total liability shall not exceed the amount paid for the specific product or service in question.
            </p>
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Dispute Resolution</h2>
          
          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              <strong>Governing Law:</strong> These Terms shall be governed by the laws of England and Wales.
            </p>
            <p>
              <strong>Jurisdiction:</strong> You agree to submit to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border-2 p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Questions About Our Terms?</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            For questions regarding these Terms of Service, please contact:
          </p>
          <div className="space-y-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p><FaEnvelope className="inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }} /> Email: <a href="mailto:legal@wolfsuppliesltd.co.uk" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>legal@wolfsuppliesltd.co.uk</a></p>
            <p><FaPhone className="inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }} /> Phone: <a href="tel:+447398998101" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>+44 7398 998101</a></p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-sm mt-8" style={{ color: 'var(--color-text-primary, #000000)' }}>
          Last updated: January 19, 2026 | Wolf Supplies LTD
        </p>
      </div>
    </div>
  );
};

export default PoliciesTermsPage;
