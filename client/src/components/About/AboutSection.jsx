import React from 'react';

const AboutSection = () => {
    return (
        <section className="pt-4 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#2F2F2F' }}>
                        Welcome to Wolf Supplies Ltd - Premium E-Commerce Solutions
                    </h2>
                    <p className="text-lg leading-relaxed" style={{ color: '#6B6B6B' }}>
                        At <span style={{ color: '#000000', fontWeight: 'bold' }}>Wolf Supplies Ltd</span>, we're your trusted one-stop destination
                        for premium products and services. Whether you're a homeowner, business professional, or contractor, we deliver reliable
                        solutions and superior quality products to help you complete every project with confidence.
                    </p>
                </div>

                {/* Wide Range Section */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-6" style={{ color: '#2F2F2F' }}>
                        Wide Range of Products for Every Need
                    </h3>
                    <p className="text-lg leading-relaxed mb-8" style={{ color: '#6B6B6B' }}>
                        We offer a carefully curated selection of premium products and services designed for quality, performance, and reliability.
                    </p>

                    {/* Product Categories */}
                    <div className="space-y-6">
                        {/* Category 1 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: '#2F2F2F' }}>
                                Premium Home & Garden Solutions
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: '#6B6B6B' }}>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Home Improvement Essentials</span> - Premium materials and fixtures ideal for home maintenance, repairs, and creative projects</li>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Garden & Outdoor Solutions</span> - Durable products and accessories designed for outdoor living and landscaping needs</li>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Quality Home Accessories</span> - Stylish and functional items to enhance your living spaces</li>
                            </ul>
                        </div>

                        {/* Category 2 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: '#2F2F2F' }}>
                                Professional & Commercial Products
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: '#6B6B6B' }}>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Premium Materials & Components</span> - High-quality products sourced from trusted manufacturers for professional applications</li>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Tools & Equipment</span> - Durable professional-grade tools designed for reliability and long-lasting performance</li>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Workspace Essentials</span> - Everything you need to create efficient and productive work environments</li>
                            </ul>
                        </div>

                        {/* Category 3 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: '#2F2F2F' }}>
                                Safety & Quality Standards
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: '#6B6B6B' }}>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Safety Certified Products</span> - All products meet rigorous safety and quality standards for peace of mind</li>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Reliable Performance</span> - Tested and verified for durability, longevity, and superior performance</li>
                                <li><span style={{ color: '#000000', fontWeight: 'bold' }}>Quality Assurance</span> - Every item undergoes strict quality control before reaching our customers</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: '#E5E5E5' }}>
                    <h3 className="text-3xl font-bold mb-8" style={{ color: '#2F2F2F' }}>
                        Why Choose PropertyWolf?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: '#000000' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: '#2F2F2F' }}>Trusted by Professionals & Homeowners</h4>
                                <p style={{ color: '#6B6B6B' }}>Products designed for efficiency, quality, and long-lasting results</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: '#000000' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: '#2F2F2F' }}>Premium Quality & Tested Materials</h4>
                                <p style={{ color: '#6B6B6B' }}>All products are performance-tested for durability and reliability</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: '#000000' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: '#2F2F2F' }}>Competitive Pricing</h4>
                                <p style={{ color: '#6B6B6B' }}>Great value without compromising on product quality and integrity</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: '#000000' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: '#2F2F2F' }}>Fast & Reliable Delivery</h4>
                                <p style={{ color: '#6B6B6B' }}>Quick shipping and delivery with transparent tracking and updates</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: '#000000' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: '#2F2F2F' }}>Secure & Easy Online Ordering</h4>
                                <p style={{ color: '#6B6B6B' }}>Shop with confidence through our secure, easy-to-use platform</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: '#000000' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: '#2F2F2F' }}>Dedicated Customer Support</h4>
                                <p style={{ color: '#6B6B6B' }}>Our team is ready to help with any questions or special requests</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* One Stop Source Section */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-6" style={{ color: '#2F2F2F' }}>
                        Your One-Stop Source for Premium Products
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ color: '#6B6B6B' }}>
                        From home improvement essentials to professional-grade materials, <span style={{ color: '#000000', fontWeight: 'bold' }}>Wolf Supplies Ltd</span> simplifies
                        shopping with curated categories that meet your exact needs. Whether you're upgrading your home, undertaking renovation projects,
                        or sourcing materials for contractors, we have the quality products and expert support to help you succeed.
                    </p>
                </div>

                {/* Get Started Section */}
                <div className="p-8 rounded-lg" style={{ backgroundColor: '#2F2F2F' }}>
                    <h3 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                        Get Started Today
                    </h3>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: '#E5E5E5' }}>
                        Browse our categories, discover top-rated products, and take advantage of exclusive customer service and
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}> fast delivery on all UK orders</span>. At <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Wolf Supplies Ltd</span>,
                        we are committed to supplying products that you can rely on, install easily, and enjoy for years to come.
                    </p>
                    <button
                        className="px-8 py-3 text-lg font-bold rounded-lg transition-all hover:bg-gray-800"
                        style={{ backgroundColor: 'white', color: '#000000' }}
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
