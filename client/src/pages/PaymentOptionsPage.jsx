import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useMetaTags from '../hooks/useMetaTags';
import { SiVisa, SiMastercard, SiDiscover, SiApplepay, SiGooglepay } from 'react-icons/si';
import { FaLock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const PaymentOptionsPage = () => {
    // Set up meta tags for SEO
    useMetaTags({
        title: 'Secure Payment Options | Wolf Supplies LTD - PCI DSS Compliant',
        description: 'Wolf Supplies LTD offers secure payment methods: Credit Cards, Apple Pay, and Google Pay. All transactions are PCI DSS Level 1 compliant and SSL encrypted. UK company registered 16070029.',
        keywords: 'payment, secure checkout, credit card, digital wallet, apple pay, google pay, PCI compliance, UK merchant, SSL encrypted',
        url: typeof window !== 'undefined' ? window.location.href : '',
    });

    const [expandedCard, setExpandedCard] = useState(null); // All open by default

    const paymentMethods = [
        {
            id: 1,
            name: 'Credit & Debit Cards',
            icon: <SiVisa className="text-4xl text-blue-600" />,
            description: 'We accept all major credit and debit cards including Visa, Mastercard, and Discover.',
            features: [
                '✓ Instant payments',
                '✓ Secure encryption',
                '✓ No extra fees',
                '✓ Fast checkout process',
                '✓ Works worldwide'
            ],
            cards: [
                { name: 'Visa', icon: <SiVisa className="text-3xl text-blue-600" /> },
                { name: 'Mastercard', icon: <SiMastercard className="text-3xl text-red-600" /> },
                { name: 'Discover', icon: <SiDiscover className="text-3xl text-orange-500" /> }
            ]
        },
        {
            id: 2,
            name: 'Apple Pay',
            icon: <SiApplepay className="text-4xl text-black" />,
            description: 'Quick, easy, and secure payment with your Apple device.',
            features: [
                '✓ One-click checkout',
                '✓ Biometric security',
                '✓ Works on Apple devices',
                '✓ Encrypted payments',
                '✓ No card details stored'
            ],
            details: 'Use your saved credit or debit cards for faster, more secure purchases on supported Apple devices.'
        },
        {
            id: 3,
            name: 'Google Pay',
            icon: <SiGooglepay className="text-4xl text-blue-500" />,
            description: 'Fast and simple payment method for Android users.',
            features: [
                '✓ Quick checkout',
                '✓ Biometric authentication',
                '✓ Works on Android devices',
                '✓ Safe transactions',
                '✓ Payment history tracking'
            ],
            details: 'Google Pay lets you pay quickly and securely using your Android device or Chrome browser.'
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">Payment Options</h1>
                    <p className="text-xl text-[var(--color-text-light)] max-w-3xl mx-auto mb-6">
                        We offer multiple secure payment methods to make shopping with us convenient and safe. Choose the payment method that works best for you.
                    </p>

                    {/* VAT-Free Banner */}
                    <div className="bg-[var(--color-bg-section)] border-2 border-[var(--color-accent-primary)] rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                        <p className="text-[var(--color-text-primary)] font-semibold text-lg">
                            ✓ All our prices are VAT-free. The price you see is the price you pay.
                        </p>
                    </div>
                </div>

                {/* Payment Methods Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {paymentMethods.map((method, index) => (
                        <div
                            key={method.id}
                            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-200"
                        >
                            {/* Card Header */}
                            <div
                                className="p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition duration-300"
                                onClick={() => setExpandedCard(expandedCard === index ? -1 : index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {method.icon}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{method.name}</h3>
                                            <p className="text-gray-600 text-sm">{method.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-2xl text-gray-400">
                                        {expandedCard === index ? '−' : '+'}
                                    </div>
                                </div>
                            </div>

                            {/* Card Content - Always Visible */}
                            <div className="p-6 border-t border-gray-200">
                                <div className="space-y-6">
                                    {/* Features */}
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-3">Benefits</h4>
                                        <ul className="grid grid-cols-2 gap-2">
                                            {method.features.map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-gray-700 text-sm flex items-center"
                                                >
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Details */}
                                    {method.details && (
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 mb-2">How it Works</h4>
                                            <p className="text-gray-600">{method.details}</p>
                                        </div>
                                    )}

                                    {/* Card Logos */}
                                    {method.cards && (
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 mb-3">Supported Cards</h4>
                                            <div className="flex gap-4 flex-wrap">
                                                {method.cards.map((card, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        {card.icon}
                                                        <span className="text-sm text-gray-600">{card.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Note */}
                                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                        <p className="text-sm text-blue-900">
                                            <strong><FaLock className="inline mr-2" />Secure:</strong> All payments are encrypted and processed securely. Your financial information is never stored on our servers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Security Section */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-12 border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Security & Compliance</h2>
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div className="text-center">
                            <FaLock className="text-4xl mb-3 text-blue-600 mx-auto" />
                            <h3 className="font-bold text-lg mb-2">SSL Encryption</h3>
                            <p className="text-gray-600">All payment data is encrypted using industry-standard SSL technology.</p>
                        </div>
                        <div className="text-center">
                            <FaCheckCircle className="text-4xl mb-3 text-green-600 mx-auto" />
                            <h3 className="font-bold text-lg mb-2">PCI Compliance</h3>
                            <p className="text-gray-600">We comply with Payment Card Industry Data Security Standards.</p>
                        </div>
                        <div className="text-center">
                            <FaShieldAlt className="text-4xl mb-3 text-red-600 mx-auto" />
                            <h3 className="font-bold text-lg mb-2">Fraud Protection</h3>
                            <p className="text-gray-600">Advanced fraud detection systems protect every transaction.</p>
                        </div>
                    </div>

                    {/* GDPR Compliance Notice */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="font-bold text-lg text-purple-900 mb-3">GDPR Compliance & Data Privacy</h3>
                        <ul className="text-purple-900 text-sm space-y-2">
                            <li>✓ We comply with General Data Protection Regulation (GDPR) standards</li>
                            <li>✓ Your personal data is protected and never shared with third parties for marketing without consent</li>
                            <li>✓ You have the right to access, modify, or delete your personal information at any time</li>
                            <li>✓ All data is encrypted and stored securely on compliant servers</li>
                            <li>✓ We only collect data necessary for processing your order and payment</li>
                            <li>✓ Read our full <Link to="/policies/privacy" className="underline font-semibold">Privacy Policy</Link> for more details</li>
                        </ul>
                    </div>
                </div>

{/* Enhanced FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Are your payments secure?</h3>
              <p className="text-gray-600">Yes, we use SSL encryption and comply with PCI DSS standards to ensure all payments are secure. All transactions are protected with advanced fraud detection systems.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Which payment method is fastest?</h3>
              <p className="text-gray-600">Apple Pay and Google Pay offer the quickest checkout experience for supported devices. Credit/debit cards are also very fast, typically processed instantly.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Can I change my payment method after checkout?</h3>
              <p className="text-gray-600">You can contact our support team within 24 hours of placing an order to change your payment method. Once payment is processed, modifications may not be possible.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Do you accept international payments?</h3>
              <p className="text-gray-600">Yes, all our payment methods accept international transactions. Our prices are displayed in GBP and are VAT-free.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Are all prices VAT-free?</h3>
              <p className="text-gray-600">Yes, all prices shown on our website are VAT-free. The price you see at checkout is the final price you pay - no additional VAT will be added.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">How is my personal data protected?</h3>
              <p className="text-gray-600">We comply with GDPR regulations and secure all personal data with encryption. Your information is only used for order processing and is never shared with third parties without consent.</p>
            </div>
          </div>
        </div>

        {/* Google Merchant Center Compliance Section */}
        <div className="bg-blue-50 rounded-lg p-8 mb-12 border border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Business Information & Policies</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Business Details */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-bold text-xl text-gray-900 mb-4">About Wolf Supplies LTD</h3>
              <ul className="text-gray-700 space-y-3">
                <li><strong>Company Name:</strong> Wolf Supplies LTD</li>
                <li><strong>Registration:</strong> UK Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">16070029</a></li>
                <li><strong>Address:</strong> Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</li>
                <li><strong>Email:</strong> <a href="mailto:sales@wolfsuppliesltd.co.uk" className="text-blue-600 hover:underline">sales@wolfsuppliesltd.co.uk</a></li>
                <li><strong>Phone:</strong> <a href="tel:+447398998101" className="text-blue-600 hover:underline">+44 7398 998101</a></li>
                <li><strong>Website:</strong> <a href="https://wolfsuppliesltd.co.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">wolfsuppliesltd.co.uk</a></li>
              </ul>
            </div>

            {/* Important Policies */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Our Policies</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/policies/shipping" className="text-blue-600 hover:underline font-semibold">✓ Shipping Policy</Link>
                  <p className="text-gray-600 text-sm">Learn about our delivery times and shipping methods.</p>
                </li>
                <li>
                  <Link to="/policies/returns-refund" className="text-blue-600 hover:underline font-semibold">✓ Return & Refunds Policy</Link>
                  <p className="text-gray-600 text-sm">31-day returns, no questions asked. Full refund guarantee.</p>
                </li>
                <li>
                  <Link to="/policies/terms" className="text-blue-600 hover:underline font-semibold">✓ Terms of Service</Link>
                  <p className="text-gray-600 text-sm">Our complete terms and conditions for shopping with us.</p>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Trust & Security Badges */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Shop With Us?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Verified Business</h4>
              <p className="text-gray-600 text-sm">UK Registered Company with verified credentials</p>
            </div>
            <div className="text-center">
              <FaLock className="text-4xl text-blue-600 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Secure Payments</h4>
              <p className="text-gray-600 text-sm">SSL encrypted transactions and PCI DSS compliant</p>
            </div>
            <div className="text-center">
              <FaShieldAlt className="text-4xl text-red-600 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Buyer Protection</h4>
              <p className="text-gray-600 text-sm">31-day money back guarantee on all purchases</p>
            </div>
            <div className="text-center">
              <FaCheckCircle className="text-4xl text-purple-600 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">GDPR Compliant</h4>
              <p className="text-gray-600 text-sm">Your data privacy is our priority</p>
            </div>
          </div>
        </div>

                {/* CTA Section */}
                <div className="bg-black rounded-lg p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
                    <p className="text-xl text-gray-300 mb-6">Browse our products and choose from any of our secure payment methods.</p>
                    <Link
                        to="/products"
                        className="inline-block px-8 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition duration-300 rounded"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentOptionsPage;
