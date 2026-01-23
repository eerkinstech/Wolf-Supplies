import React from 'react';
import { Link } from 'react-router-dom';
import { FaUndoAlt, FaMoneyBillWave, FaClock, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesReturnsPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-section)]">
      {/* Header Section */}
      <div className="bg-[var(--color-accent-primary)] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-100 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaUndoAlt className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Return & Refunds Policy</h1>
          </div>
          <p className="text-gray-100 text-lg">31 Days Return & Refund - UK</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaClock className="text-[var(--color-accent-primary)] text-2xl" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">31 Days Return & Refund Window</h2>
          </div>
          <p className="text-[var(--color-text-light)] mb-4 leading-relaxed">
            At Wolf Supplies LTD, we want you to be completely satisfied with your purchase. If you're not happy with your item, you can return it within <span className="font-bold text-[var(--color-accent-primary)]">31 days</span> of delivery for a full refund or exchange. This forms our <strong>31 Days Return & Refund</strong> policy.
          </p>
          <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded mb-4">
            <p className="text-[var(--color-text-light)] mb-2">
              <strong>Consumer Rights:</strong> This policy complies with UK Consumer Rights Act 2015 and provides protection for all purchases.
            </p>
          </div>
          <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded text-sm">
            <p className="text-[var(--color-text-light)]"><strong>Wolf Supplies Ltd | Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">16070029</a></strong></p>
            <p className="text-[var(--color-text-light)]">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
          </div>
        </div>

        {/* Return Eligibility */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">What Can Be Returned?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Eligible */}
            <div>
              <h3 className="text-xl font-bold text-[var(--color-accent-primary)] mb-4">✅ Eligible for Return</h3>
              <ul className="space-y-3 text-[var(--color-text-light)]">
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                  <span>Unused items in original packaging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                  <span>Defective or damaged products</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                  <span>Wrong item sent</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                  <span>Item not as described</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                  <span>Faulty items</span>
                </li>
              </ul>
            </div>

            {/* Non-Eligible */}
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-4">❌ Not Eligible for Return</h3>
              <ul className="space-y-3 text-[var(--color-text-light)]">
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Items used or worn</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Damage caused by misuse</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Missing original packaging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Items returned after 31 days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refund Details */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FaMoneyBillWave className="text-[var(--color-accent-primary)] text-2xl" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Refund Details</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-[var(--color-text-primary)] mb-2">🔄 Refund Timeline</h3>
              <p className="text-[var(--color-text-light)] mb-3">
                Once we receive and inspect your returned item:
              </p>
              <ul className="list-disc list-inside text-[var(--color-text-light)] space-y-2">
                <li>Inspection: 3-5 business days</li>
                <li>Refund Approval: 1-2 business days</li>
                <li>Refund Processing: 5-10 business days to your original payment method</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--color-text-primary)] mb-2">💳 What Gets Refunded</h3>
              <ul className="list-disc list-inside text-[var(--color-text-light)] space-y-2">
                <li>Full product price</li>
                <li>Original shipping cost (for defective items)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[var(--color-bg-section)] rounded-lg border-2 border-[var(--color-border-light)] p-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Need Help With a Return?</h2>
          <p className="text-[var(--color-text-light)] mb-4">
            Our support team is ready to assist you:
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

export default PoliciesReturnsPage;
