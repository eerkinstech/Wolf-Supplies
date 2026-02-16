const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User.js');
const Category = require('./models/Category.js');
const Product = require('./models/Product.js');
const Page = require('./models/Page.js');
const Policy = require('./models/Policy.js');

const seedDB = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Page.deleteMany({});
    await Policy.deleteMany({});

    // Hash passwords
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
    const userPasswordHash = await bcrypt.hash('User@123', saltRounds);

    // Create admin and regular users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street, Tech City',
    });
    await User.collection.insertOne(adminUser.toObject());

    const regularUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPasswordHash,
      role: 'user',
      phone: '+0987654321',
      address: '456 User Avenue, Commerce Town',
    });
    await User.collection.insertOne(regularUser.toObject());

    // Create parent categories with images
    const parentCategories = await Category.create([
      { name: 'Gadgets & Electronics', slug: 'gadgets-electronics', description: 'Gadgets, electronics and accessories', image: 'https://images.unsplash.com/photo-1510557880182-3a935d4c205e?w=500&h=500&fit=crop' },
      { name: 'Home & Living', slug: 'home-living', description: 'Home decor, kitchen and living essentials', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&h=500&fit=crop' },
      { name: 'Fashion Picks', slug: 'fashion-picks', description: 'Trending fashion, apparel and accessories', image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd45?w=500&h=500&fit=crop' },
      { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports equipment and fitness gear', image: 'https://images.unsplash.com/photo-1571019613914-85f342c86d68?w=500&h=500&fit=crop' },
      { name: 'Books & Media', slug: 'books-media', description: 'Books, ebooks and learning materials', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&h=500&fit=crop' },
    ]);

    // Subcategories with images
    const subcategories = await Category.create([
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices', parent: parentCategories[0]._id, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop' },
      { name: 'Gadgets', slug: 'gadgets', description: 'Small gadgets and tech accessories', parent: parentCategories[0]._id, image: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=500&h=500&fit=crop' },
      { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and tools', parent: parentCategories[1]._id, image: 'https://images.unsplash.com/photo-1586201375761-83865001e0a7?w=500&h=500&fit=crop' },
      { name: 'Living', slug: 'living', description: 'Living room decor and furniture', parent: parentCategories[1]._id, image: 'https://images.unsplash.com/photo-1567016542201-18f7c5b92336?w=500&h=500&fit=crop' },
      { name: 'Clothing', slug: 'clothing', description: 'Apparel and garments', parent: parentCategories[2]._id, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop' },
      { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories', parent: parentCategories[2]._id, image: 'https://images.unsplash.com/photo-1571070613815-6c1cfdca1a30?w=500&h=500&fit=crop' },
    ]);

    const categories = parentCategories.concat(subcategories);
    const catBySlug = (slug) => (categories.find((c) => c.slug === slug) || {})._id;

    // Products with multiple images
    const products = await Product.create([
      {
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 89.99,
        originalPrice: 129.99,
        discount: 30,
        categories: [catBySlug('electronics')],
        stock: 150,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&h=800&fit=crop'
        ],
        rating: 4.5,
        numReviews: 128,
      },
      {
        name: 'Mechanical Keyboard RGB',
        slug: 'mechanical-keyboard-rgb',
        description: 'RGB mechanical keyboard with custom switches',
        price: 149.99,
        originalPrice: 199.99,
        discount: 25,
        categories: [catBySlug('electronics')],
        stock: 85,
        images: [
          'https://images.unsplash.com/photo-1587829191301-7b5f83d7c8a1?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1587202372775-7d4a09b1c9bb?w=800&h=800&fit=crop'
        ],
        rating: 4.7,
        numReviews: 95,
      },
      {
        name: 'Smartwatch Pro',
        slug: 'smartwatch-pro',
        description: 'Feature-packed smartwatch with health monitoring',
        price: 199.99,
        originalPrice: 249.99,
        discount: 20,
        categories: [catBySlug('gadgets')],
        stock: 120,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?w=800&h=800&fit=crop'
        ],
        rating: 4.6,
        numReviews: 210,
      },
      {
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-tshirt',
        description: 'Comfortable classic cotton t-shirt in multiple colors',
        price: 24.99,
        originalPrice: 39.99,
        discount: 37,
        categories: [catBySlug('clothing')],
        stock: 200,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1520975698519-4b9a0a8a3a3c?w=800&h=800&fit=crop'
        ],
        rating: 4.4,
        numReviews: 156,
      },
      {
        name: 'Leather Wallet',
        slug: 'leather-wallet',
        description: 'Premium leather wallet with multiple compartments',
        price: 49.99,
        originalPrice: 69.99,
        discount: 28,
        categories: [catBySlug('accessories')],
        stock: 140,
        images: [
          'https://images.unsplash.com/photo-1555529669-2564d5a7f1d1?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542293787938-c9e299b880b2?w=800&h=800&fit=crop'
        ],
        rating: 4.5,
        numReviews: 78,
      },
      {
        name: 'Modern Plant Pot',
        slug: 'modern-plant-pot',
        description: 'Stylish ceramic plant pot for indoor plants',
        price: 34.99,
        originalPrice: 49.99,
        discount: 30,
        categories: [catBySlug('living')],
        stock: 180,
        images: [
          'https://images.unsplash.com/photo-1599599810694-b5ac4dd5ccf1?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=800&fit=crop'
        ],
        rating: 4.3,
        numReviews: 134,
      },
      {
        name: 'LED Desk Lamp',
        slug: 'led-desk-lamp',
        description: 'Adjustable LED desk lamp with touch control',
        price: 44.99,
        originalPrice: 69.99,
        discount: 35,
        categories: [catBySlug('living')],
        stock: 95,
        images: [
          'https://images.unsplash.com/photo-1565636192335-14a578e23c5d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=800&fit=crop'
        ],
        rating: 4.7,
        numReviews: 102,
      },
      {
        name: 'Nonstick Frying Pan Set',
        slug: 'nonstick-frying-pan-set',
        description: '3-piece nonstick frying pan set for everyday cooking',
        price: 59.99,
        originalPrice: 79.99,
        discount: 25,
        categories: [catBySlug('kitchen')],
        stock: 160,
        images: [
          'https://images.unsplash.com/photo-1498575207490-3c0b6d7d9c34?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&h=800&fit=crop'
        ],
        rating: 4.4,
        numReviews: 64,
      },
      {
        name: 'Yoga Mat',
        slug: 'yoga-mat',
        description: 'Non-slip premium yoga mat 6mm thickness',
        price: 29.99,
        originalPrice: 44.99,
        discount: 33,
        categories: [catBySlug('sports-fitness')],
        stock: 220,
        images: [
          'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1554284126-aa88f22d8b5f?w=800&h=800&fit=crop'
        ],
        rating: 4.6,
        numReviews: 178,
      },
      {
        name: 'Dumbbell Set',
        slug: 'dumbbell-set',
        description: 'Adjustable dumbbell set 5-50 lbs',
        price: 189.99,
        originalPrice: 249.99,
        discount: 24,
        categories: [catBySlug('sports-fitness')],
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1638805692887-592046191519?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1583454110551-21a8a5b8d1d5?w=800&h=800&fit=crop'
        ],
        rating: 4.8,
        numReviews: 145,
      },
      {
        name: 'Fiction Novel - The Adventure',
        slug: 'fiction-novel-adventure',
        description: 'Bestselling fiction novel about adventure and discovery',
        price: 14.99,
        originalPrice: 19.99,
        discount: 25,
        categories: [catBySlug('books-media')],
        stock: 300,
        images: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=800&fit=crop'
        ],
        rating: 4.5,
        numReviews: 234,
      },
      {
        name: 'Business Guide Book',
        slug: 'business-guide-book',
        description: 'Comprehensive guide to starting and growing a business',
        price: 24.99,
        originalPrice: 34.99,
        discount: 28,
        categories: [catBySlug('books-media')],
        stock: 150,
        images: [
          'https://images.unsplash.com/photo-1507842217343-583f20270319?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=800&fit=crop'
        ],
        rating: 4.7,
        numReviews: 89,
      }
    ]);

    // Create Pages
    const pages = await Page.insertMany([
      {
        title: 'About Us',
        slug: 'about',
        description: 'Learn more about our company and mission',
        content: '<h1>About Our Store</h1><p>We are committed to providing the best shopping experience with quality products and excellent customer service. Our mission is to make shopping convenient, affordable, and enjoyable for everyone.</p>',
        metaDescription: 'About our e-commerce store - quality products and customer service',
        metaKeywords: 'about, company, mission, quality products',
        isPublished: true,
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        description: 'Get in touch with our customer support team',
        content: '<h1>Contact Us</h1><p>Have a question? We\'d love to hear from you. Please reach out to our support team at support@ecommerce.com or call us at 1-800-SHOP-NOW.</p><p>Email: support@ecommerce.com<br/>Phone: 1-800-SHOP-NOW<br/>Hours: Monday - Friday, 9AM - 6PM EST</p>',
        metaDescription: 'Contact our customer support team',
        metaKeywords: 'contact, support, customer service',
        isPublished: true,
      }
    ]);

    // Create Policies
    const policies = await Policy.insertMany([
      {
        title: 'Shipping Policy',
        slug: 'shipping',
        description: 'Learn about our shipping and delivery options',
        content: '<h1>Shipping Policy</h1><p><strong>Free Shipping:</strong> Orders over $50 qualify for free standard shipping (5-7 business days).</p><p><strong>Express Shipping:</strong> Available for $9.99 (2-3 business days).</p><p><strong>Overnight Shipping:</strong> Available for $19.99.</p><p>Orders are typically shipped within 1-2 business days. Tracking information will be provided via email.</p>',
        metaDescription: 'Our shipping policy and delivery information',
        metaKeywords: 'shipping, delivery, free shipping, express',
        isPublished: true,
      },
      {
        title: 'Returns & Refunds',
        slug: 'returns-refunds',
        description: 'Easy returns and refund policy',
        content: '<h1>Returns & Refunds Policy</h1><p><strong>30-Day Return Window:</strong> All items can be returned within 30 days of purchase for a full refund.</p><p><strong>Condition Requirements:</strong> Items must be unused, in original packaging, and in resalable condition.</p><p><strong>Refund Process:</strong> Once received and inspected, refunds are processed within 5-7 business days.</p><p><strong>Return Shipping:</strong> We cover return shipping for defective items. Standard returns are customer-paid.</p>',
        metaDescription: 'Our returns and refunds policy',
        metaKeywords: 'returns, refunds, return policy, money back',
        isPublished: true,
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy',
        description: 'How we protect your personal information',
        content: '<h1>Privacy Policy</h1><p><strong>Data Collection:</strong> We collect personal information you provide during registration, checkout, and account management.</p><p><strong>Information Use:</strong> Your information is used to process orders, improve services, and send promotional content (opt-out available).</p><p><strong>Data Security:</strong> We use industry-standard SSL encryption to protect your data during transmission.</p><p><strong>Third Parties:</strong> We never sell or share your personal information with third parties without your consent.</p><p><strong>Contact:</strong> For privacy concerns, please contact privacy@ecommerce.com</p>',
        metaDescription: 'Our privacy policy and data protection',
        metaKeywords: 'privacy, data protection, security',
        isPublished: true,
      },
      {
        title: 'Terms of Service',
        slug: 'terms',
        description: 'Terms and conditions for using our store',
        content: '<h1>Terms of Service</h1><p><strong>Acceptance:</strong> By using our store, you agree to these terms and conditions.</p><p><strong>Product Information:</strong> We strive to provide accurate product descriptions and pricing. We reserve the right to correct any errors.</p><p><strong>Limitations of Liability:</strong> Our store is provided "as-is". We are not liable for indirect or consequential damages.</p><p><strong>Modifications:</strong> We reserve the right to modify these terms at any time. Changes are effective immediately upon posting.</p>',
        metaDescription: 'Terms of service for our e-commerce store',
        metaKeywords: 'terms, conditions, service agreement',
        isPublished: true,
      }
    ]);

    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
};

seedDB();

