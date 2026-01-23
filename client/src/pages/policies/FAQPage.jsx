import React from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa';

const PoliciesFAQPage = () => {
  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard UK delivery takes 2-4 business days from order confirmation. We offer free shipping on all orders worldwide.'
    },
    {
      question: 'What is your return policy?',
      answer: 'You have 31 days from delivery to return unused items for a full refund or exchange. We provide prepaid return labels for your convenience.'
    },
    {
      question: 'Is shipping free?',
      answer: 'Free standard shipping on all orders worldwide. No minimum spend required.'
    },
    {
      question: 'How can I track my order?',
      answer: 'You\'ll receive a tracking number via email once your order ships. You can track your package in real-time on our website.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. All payments are processed securely.'
    },
    {
      question: 'What if my item arrives damaged?',
      answer: 'Report damage within 48 hours with photos. We\'ll immediately send a replacement or issue a full refund at no cost to you.'
    },
    {
      question: 'Can I change my order after placing it?',
      answer: 'Contact us immediately at support@wolfsuppliesltd.co.uk. If your order hasn\'t shipped, we may be able to make changes.'
    },
    {
      question: 'How do I contact customer support?',
      answer: 'Email: support@wolfsuppliesltd.co.uk | Phone: +44 7398 998101 | Monday-Friday, 9 AM - 6 PM GMT'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-section)]">
      {/* Header Section */}
      <div className="bg-[var(--color-accent-primary)] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-100 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaQuestionCircle className="text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-100 text-lg">Find Answers to Common Questions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300 group"
            >
              <summary className="flex items-center justify-between font-bold text-[var(--color-text-primary)] text-lg select-none">
                <span>{faq.question}</span>
                <span className="text-[var(--color-text-light)] transition duration-300 group-open:rotate-180">▼</span>
              </summary>
              <p className="text-[var(--color-text-light)] mt-4 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="bg-[var(--color-bg-section)] rounded-lg border-2 border-[var(--color-border-light)] p-8 mt-12">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Didn't Find Your Answer?</h2>
          <p className="text-[var(--color-text-light)] mb-6">
            Our support team at Wolf Supplies Ltd is here to help with any questions or concerns you may have.
          </p>
          <div className="space-y-2 text-[var(--color-text-light)] mb-6">
            <p><FaEnvelope className="inline mr-2 text-[var(--color-accent-primary)]" /> Email: <a href="mailto:support@wolfsuppliesltd.co.uk" className="text-[var(--color-accent-primary)] hover:underline">support@wolfsuppliesltd.co.uk</a></p>
            <p><FaPhone className="inline mr-2 text-[var(--color-accent-primary)]" /> Phone: <a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline">+44 7398 998101</a></p>
            <p>⏰ Hours: Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>
          <div className="bg-[var(--color-bg-primary)] p-4 rounded border border-[var(--color-border-light)]">
            <p className="text-sm text-[var(--color-text-light)]"><strong>Company Details:</strong></p>
            <p className="text-sm text-[var(--color-text-light)]">Wolf Supplies LTD</p>
            <p className="text-sm text-[var(--color-text-light)]">Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">16070029</a></p>
            <p className="text-sm text-[var(--color-text-light)]">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesFAQPage;
