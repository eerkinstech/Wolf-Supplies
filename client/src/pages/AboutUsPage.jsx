import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaCheck, FaUsers, FaGlobeEurope, FaTrophy, FaLeaf } from 'react-icons/fa';

// Load images from src/assets using Vite glob and pick those that mention "warehouse".
// This handles filenames like: "warehouse images (1).png" or "warehouse-01.jpg".
const allImgs = import.meta.glob('/src/assets/*.{jpg,jpeg,png,webp}', { eager: true });
const warehouseImages = Object.keys(allImgs)
  .filter((p) => {
    const name = p.split('/').pop().toLowerCase();
    return name.includes('warehouse');
  })
  .map((p) => ({
    path: p,
    file: p.split('/').pop()
  }))
  .sort((a, b) => {
    const na = a.file.match(/(\d+)/);
    const nb = b.file.match(/(\d+)/);
    const ia = na ? parseInt(na[1], 10) : 0;
    const ib = nb ? parseInt(nb[1], 10) : 0;
    if (ia === ib) return a.file.localeCompare(b.file);
    return ia - ib;
  })
  .map((entry) => {
    const mod = allImgs[entry.path];
    return mod && (mod.default || mod);
  });

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-6 hover:text-gray-100 w-fit">
            <FaArrowLeft /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Wolf Supplies LTD</h1>
          <p className="text-xl text-gray-100">Your Trusted Online Shopping Destination</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Story */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Wolf Supplies LTD was founded with a simple mission: to revolutionize online shopping in the United Kingdom. We believe everyone deserves access to quality products at competitive prices, delivered with exceptional customer service.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                What started as a small venture has grown into a trusted marketplace serving thousands of satisfied customers across the UK. We pride ourselves on our commitment to excellence, innovation, and customer satisfaction.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Today, Wolf Supplies LTD continues to expand its product range and improve its services, always keeping our customers at the heart of everything we do.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200">
              <div className="text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Wolf Supplies LTD</h3>
                <p className="text-gray-700 mb-4">Your trusted online shopping partner since 2024</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Wolf Supplies Ltd</strong></p>
                  <p>Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline">16070029</a></p>
                  <p>Registered in United Kingdom</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaCheck className="text-gray-400 text-2xl" />
                Our Mission
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To provide customers with a seamless, trustworthy, and enjoyable shopping experience by offering a curated selection of quality products, competitive pricing, and exceptional customer service across the United Kingdom.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-gray-800">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaTrophy className="text-gray-700 text-2xl" />
                Our Vision
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To become the leading UK online marketplace trusted by millions, known for innovation, customer-centricity, sustainability, and creating a positive impact on communities we serve.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaUsers,
                title: 'Customer First',
                desc: 'We put our customers at the center of everything we do, listening to feedback and continuously improving.'
              },
              {
                icon: FaCheck,
                title: 'Quality & Integrity',
                desc: 'We maintain the highest standards of quality products and honest business practices.'
              },
              {
                icon: FaLeaf,
                title: 'Sustainability',
                desc: 'We are committed to environmentally responsible practices and ethical sourcing.'
              }
            ].map((value, idx) => {
              const IconComponent = value.icon;
              return (
                <div key={idx} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
                  <IconComponent className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-700">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* By The Numbers */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: '50K+', label: 'Products Available', icon: FaStar },
              { number: '100K+', label: 'Happy Customers', icon: FaUsers },
              { number: '2-4', label: 'Day Shipping', icon: FaGlobeEurope },
              { number: '31', label: 'Day Returns', icon: FaCheck }
            ].map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-lg p-6 text-center border-2 border-gray-200">
                  <IconComponent className="text-3xl text-gray-400 mx-auto mb-3" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                  <p className="text-gray-700 font-semibold">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Wolf Supplies?</h2>
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                '✓ Wide Selection of Quality Products',
                '✓ Competitive Pricing & Regular Discounts',
                '✓ Fast UK Delivery (2-4 Business Days)',
                '✓ 30-Day Money-Back Guarantee',
                '✓ 24/7 Customer Support',
                '✓ Secure Payment Processing',
                '✓ UK GDPR Compliant Data Protection',
                '✓ Easy Returns & Refunds'
              ].map((feature, idx) => (
                <p key={idx} className="text-lg text-gray-700 font-semibold flex items-center gap-3">
                  <span className="text-gray-400 text-2xl">✓</span>
                  {feature.replace('✓ ', '')}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Warehouse & Facilities */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Our Warehouse & Facilities</h2>
          <p className="text-center text-gray-600 text-lg mb-12">
            Based in Birmingham, United Kingdom - State-of-the-art facilities ensuring fast and reliable service to customers across the UK
          </p>
          <div className="bg-white rounded-lg p-6 mb-8 border-l-4 border-gray-400">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Location</h3>
            <p className="text-gray-700 mb-2"><strong>Unit 4 Atlas Estates</strong></p>
            <p className="text-gray-700 mb-2">Colebrook Road</p>
            <p className="text-gray-700 mb-4">Birmingham, West Midlands, B11 2NT</p>
            <p className="text-gray-600 text-sm">United Kingdom</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Large feature image */}
            <div className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 lg:col-span-2 lg:row-span-2">
              <div className="relative overflow-hidden h-64 md:h-80 lg:h-full">
                {warehouseImages[0] ? (
                  <img src={warehouseImages[0]} alt="Main Warehouse" className="object-cover w-full h-full" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <div className="text-6xl">🏭</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition duration-300"></div>
              </div>
            </div>

            {/* Remaining tiles (no captions) */}
            {[1,2,3,4].map((i) => (
              <div key={i} className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300">
                <div className="relative overflow-hidden h-40 md:h-48">
                  {warehouseImages[i] ? (
                    <img src={warehouseImages[i]} alt={`Warehouse ${i+1}`} className="object-cover w-full h-full" />
                  ) : (
                    <div className={`h-full w-full flex items-center justify-center ${i===1? 'bg-gray-700' : i===2 ? 'bg-purple-600' : i===3 ? 'bg-gray-700' : 'bg-red-600'}`}>
                      <div className="text-5xl">{i===1? '📦' : i===2? '✅' : i===3? '📮' : '🚚'}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition duration-300"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Warehouse Stats */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8 border-2 border-gray-300">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-700 mb-2">50,000+</p>
                <p className="text-gray-700">Square Feet of Warehouse Space</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-400 mb-2">24/7</p>
                <p className="text-gray-700">Operational for Customer Fulfillment</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600 mb-2">99.9%</p>
                <p className="text-gray-700">Order Accuracy Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
          <div className="bg-gradient-to-r from-gray-50 to-grey-100 rounded-lg p-12 border-2 border-gray-200 text-center">
            <p className="text-xl text-gray-700 mb-4">
              Our dedicated team of professionals is committed to bringing you the best online shopping experience.
            </p>
            <p className="text-lg text-gray-600">
              From product curation to customer service, logistics to technology, every member of our team works tirelessly to ensure your satisfaction.
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gray-900 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions About Wolf Supplies?</h2>
          <p className="text-lg text-gray-100 mb-8">
            Get in touch with our team. We'd love to hear from you!
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
