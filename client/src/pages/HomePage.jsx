import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useMetaTags from '../hooks/useMetaTags';
import Layout from '../components/Layout/Layout';
import FeaturedCategories from '../components/Categories/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '../components/Products/FeaturedProducts/FeaturedProducts';
import Newsletter from '../components/Newsletter/Newsletter';
import AboutSection from '../components/About/AboutSection';
import FeaturesSection from '../components/Features/FeaturesSection';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [featuredCategoriesConfig, setFeaturedCategoriesConfig] = useState(null);
  const [featuredProductsConfig, setFeaturedProductsConfig] = useState([]);

  // Set up meta tags for SEO
  useMetaTags({
    title: 'Wolf Supplies LTD | Premium Products & Quality Solutions',
    description: 'Shop premium products at Wolf Supplies LTD. Find quality solutions, fast UK delivery, and exceptional customer service.',
    keywords: 'products, supplies, shopping, UK delivery, quality, premium',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  /**
   * Load home page data once on component mount
   */
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    window.scrollTo(0, 0);
  }, [dispatch]);

  /**
   * Load featured collections once on component mount
   */
  useEffect(() => {
    const loadFeaturedCollections = async () => {
      try {
        const response = await fetch('/api/settings/featured-collections');
        const data = await response.json();
        setFeaturedCategoriesConfig(data?.featuredCategories || null);
        setFeaturedProductsConfig(
          Array.isArray(data?.featuredProducts) ? data.featuredProducts : []
        );
      } catch (error) {
        console.error('Error loading featured collections:', error);
      }
    };

    loadFeaturedCollections();
  }, []);

  return (
    <Layout showMenuSlider={true}>
      <div className="w-full bg-white">
        {/* Features Section */}
        <FeaturesSection />

        {/* Featured Categories */}
        <section className="py-4 px-4">
          <FeaturedCategories editorContent={featuredCategoriesConfig} />
        </section>

        {/* Featured Products */}
        {featuredProductsConfig && featuredProductsConfig.length > 0 ? (
          featuredProductsConfig.map((productConfig, index) => (
            <section key={`prod-${index}`} className="py-4 px-4">
              <FeaturedProducts editorContent={productConfig} />
            </section>
          ))
        ) : (
          <section className="py-4 px-4">
            <FeaturedProducts />
          </section>
        )}

        {/* Newsletter */}
        <section className="py-4 px-4">
          <Newsletter />
        </section>


        {/* About */}
        <section>
          <AboutSection />
        </section>

      </div>
    </Layout>
  );
};

export default HomePage;
