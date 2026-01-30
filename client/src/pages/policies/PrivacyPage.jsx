import React from 'react';
import { Link } from 'react-router-dom';
import useMetaTags from '../../hooks/useMetaTags';
import { FaLock, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesPrivacyPage = () => {
  // Set up meta tags for SEO
  useMetaTags({
    title: 'Privacy Policy | GDPR Compliant Data Protection',
    description: 'Wolf Supplies LTD Privacy Policy - GDPR compliant data protection. Learn how we protect your personal information and privacy rights.',
    keywords: 'privacy, GDPR, data protection, privacy policy, security, personal data',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      {/* Header Section */}
      <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 w-fit transition duration-300">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaLock className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-white text-lg">Your Data Protection & Privacy Rights - GDPR Compliant</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <p className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            Wolf Supplies LTD ("we", "our", or "us") is committed to protecting your personal data and privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information in accordance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
          </p>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <strong>Company Details:</strong> Wolf Supplies Ltd | Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>16070029</a> | Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom
          </p>
          <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <strong>Last Updated:</strong> January 19, 2026 | <strong>Effective Date:</strong> Immediately
          </p>
        </div>

        {/* Information We Collect */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Information We Collect</h2>

          <div className="space-y-6">
            <div className="pl-6" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>Personal Information</h3>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
                <li>Full name and contact information</li>
                <li>Email address and phone number</li>
                <li>Delivery and billing address</li>
                <li>Payment information (processed securely)</li>
              </ul>
            </div>

            <div className="pl-6" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>Account Information</h3>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
                <li>Username and password</li>
                <li>Account preferences and wishlist</li>
                <li>Order history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Data Security</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
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
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Your Data Rights (UK GDPR)</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Right to Access', desc: 'Request a copy of your personal data' },
              { title: 'Right to Rectification', desc: 'Correct inaccurate information' },
              { title: 'Right to Erasure', desc: 'Request deletion of your data' },
              { title: 'Right to Portability', desc: 'Export your data to another provider' }
            ].map((right, idx) => (
              <div key={idx} className="pl-4" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
                <h4 className="font-bold mb-1" style={{ color: 'var(--color-text-primary, #000000)' }}>{right.title}</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>{right.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border-2 p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Privacy Questions?</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            Contact our Data Protection Officer:
          </p>
          <div className="space-y-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p><FaEnvelope className="inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }} /> Email: <a href="mailto:privacy@wolfsuppliesltd.co.uk" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>privacy@wolfsuppliesltd.co.uk</a></p>
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

export default PoliciesPrivacyPage;
