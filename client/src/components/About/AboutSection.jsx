import React from 'react';

const AboutSection = () => {
    return (
        <section className="pt-4 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                        Welcome to Wolf Supplies Ltd - Premium E-Commerce Solutions
                    </h2>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        At <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>Wolf Supplies Ltd</span>, we're your trusted one-stop destination
                        for premium products and services. Whether you're a homeowner, business professional, or contractor, we deliver reliable
                        solutions and superior quality products to help you complete every project with confidence.
                    </p>
                </div>

                {/* Wide Range Section */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                        Wide Range of Products for Every Need
                    </h3>
                    <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                        We offer a carefully curated selection of premium products and services designed for quality, performance, and reliability.
                    </p>

                    {/* Product Categories */}
                    <div className="space-y-6">
                        {/* Category 1 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Premium Home & Garden Solutions
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Home Improvement Essentials</span> - Premium materials and fixtures ideal for home maintenance, repairs, and creative projects</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Garden & Outdoor Solutions</span> - Durable products and accessories designed for outdoor living and landscaping needs</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Quality Home Accessories</span> - Stylish and functional items to enhance your living spaces</li>
                            </ul>
                        </div>

                        {/* Category 2 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Professional & Commercial Products
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Premium Materials & Components</span> - High-quality products sourced from trusted manufacturers for professional applications</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Tools & Equipment</span> - Durable professional-grade tools designed for reliability and long-lasting performance</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Workspace Essentials</span> - Everything you need to create efficient and productive work environments</li>
                            </ul>
                        </div>

                        {/* Category 3 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Safety & Quality Standards
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Safety Certified Products</span> - All products meet rigorous safety and quality standards for peace of mind</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Reliable Performance</span> - Tested and verified for durability, longevity, and superior performance</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Quality Assurance</span> - Every item undergoes strict quality control before reaching our customers</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'var(--color-desert-200)' }}>
                    <h3 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-accent-secondary)' }}>
                        Why Choose PropertyWolf?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Trusted by Professionals & Homeowners</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Products designed for efficiency, quality, and long-lasting results</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Premium Quality & Tested Materials</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>All products are performance-tested for durability and reliability</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Competitive Pricing</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Great value without compromising on product quality and integrity</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Fast & Reliable Delivery</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Quick shipping and delivery with transparent tracking and updates</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Secure & Easy Online Ordering</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Shop with confidence through our secure, easy-to-use platform</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Dedicated Customer Support</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Our team is ready to help with any questions or special requests</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* One Stop Source Section */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                        Your One-Stop Source for Premium Products
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        From home improvement essentials to professional-grade materials, <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>Wolf Supplies Ltd</span> simplifies
                        shopping with curated categories that meet your exact needs. Whether you're upgrading your home, undertaking renovation projects,
                        or sourcing materials for contractors, we have the quality products and expert support to help you succeed.
                    </p>
                </div>

                {/* Get Started Section */}
                <div className="p-8 rounded-lg" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                    <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-bg-primary)' }}>
                        Get Started Today
                    </h3>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-bg-primary)' }}>
                        Browse our categories, discover top-rated products, and take advantage of exclusive customer service and
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}> fast delivery on all UK orders</span>. At <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Wolf Supplies Ltd</span>,
                        we are committed to supplying products that you can rely on, install easily, and enjoy for years to come.
                    </p>
                    <button
                        className="px-8 py-3 text-lg font-bold rounded-lg transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
