import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useElementorBuilder } from '../context/ElementorBuilderContext';
import ElementorBuilder from '../components/ElementorBuilder/ElementorBuilder';
import Layout from '../components/Layout/Layout';
import FeaturedCategories from '../components/Categories/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '../components/Products/FeaturedProducts/FeaturedProducts';
import Newsletter from '../components/Newsletter/Newsletter';
import AboutSection from '../components/About/AboutSection';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const HomePage = () => {
  const location = useLocation();
  const { isEditing, loadPage } = useElementorBuilder();
  const dispatch = useDispatch();

  const [featuredCategoriesConfig, setFeaturedCategoriesConfig] = useState(null);
  const [featuredProductsConfig, setFeaturedProductsConfig] = useState([]);

  /**
   * Fetch data only when pathname is /
   */
  useEffect(() => {
    if (location.pathname === '/') {
      dispatch(fetchCategories());
      dispatch(fetchProducts());
      loadPage('home');
      window.scrollTo(0, 0);

      // Load featured collections
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
    }
  }, [location.pathname, dispatch, loadPage]);

  /**
   * Elementor edit mode
   */
  if (isEditing) {
    return <ElementorBuilder pageId="home" />;
  }

  return (
    <Layout showMenuSlider={true}>
      <div className="w-full bg-white">

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
