import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useElementorBuilder } from '../context/ElementorBuilderContext';
import ElementorBuilder from '../components/ElementorBuilder/ElementorBuilder';
import NodeRenderer from '../components/ElementorBuilder/NodeRenderer';
import Layout from '../components/Layout/Layout';
import FeaturedCategories from '../components/Categories/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '../components/Products/FeaturedProducts/FeaturedProducts';
import Newsletter from '../components/Newsletter/Newsletter';
import AboutSection from '../components/About/AboutSection';
import Footer from '../components/Footer/Footer';
import { convertOldPageToNewSchema } from '../utils/schemaMigration';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';


const HomePage = () => {
  const location = useLocation();
  const { isEditing, rootNode, loadPage } = useElementorBuilder();
  const dispatch = useDispatch();
  const [featuredCategoriesConfig, setFeaturedCategoriesConfig] = useState(null);
  const [featuredProductsConfig, setFeaturedProductsConfig] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    loadPage('home');
    window.scrollTo(0, 0);
  }, [dispatch, loadPage, location.pathname]);

  // Fetch featured collections from admin settings
  useEffect(() => {
    const loadFeaturedCollections = async () => {
      try {
        const response = await fetch('/api/settings/featured-collections');
        const data = await response.json();

        if (data.featuredCategories) {
          setFeaturedCategoriesConfig(data.featuredCategories);
        }
        if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
          setFeaturedProductsConfig(data.featuredProducts);
        }
      } catch (error) {
        console.error('Error loading featured collections:', error);
      }
    };
    loadFeaturedCollections();
  }, [location.pathname]);

  if (isEditing) {
    return <ElementorBuilder pageId="home" />;
  }

  return (
    <Layout showMenuSlider={true}>
      <div className="w-full bg-white">
        {/* Featured Categories Section - from Admin Collections */}
        <section className="py-4 px-4 " key={`categories-${location.pathname}`}>
          <FeaturedCategories
            key={`featured-categories-${location.pathname}`}
            editorContent={featuredCategoriesConfig}
          />
        </section>

        {/* Featured Products Sections - from Admin Collections */}
        {featuredProductsConfig && featuredProductsConfig.length > 0 ? (
          featuredProductsConfig.map((productConfig, index) => (
            <section key={`products-${index}-${location.pathname}`} className="py-4 px-4">
              <FeaturedProducts
                key={`featured-products-${index}-${location.pathname}`}
                editorContent={productConfig}
              />
            </section>
          ))
        ) : (
          <section className="py-4 px-4" key={`default-products-${location.pathname}`}>
            <FeaturedProducts key={`default-featured-products-${location.pathname}`} />
          </section>
        )}

        {/* Newsletter Section */}
        <section className="py-4 px-4 ">
          <Newsletter />
        </section>

        {/* About Section */}
        <section>
          <AboutSection />
        </section>

      </div>
    </Layout>
  );
};

export default HomePage;
