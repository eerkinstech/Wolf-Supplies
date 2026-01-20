import React from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImgSrc = (img) => {
  if (!img) return '';
  if (typeof img !== 'string') return '';
  return img.startsWith('http') ? img : `${API}${img}`;
};

const CategoryCard = ({ category }) => {
  const bgColor = category?.color || 'from-gray-500/60 to-black-400/40';
  const imageSrc = category?.image || '';

  return (
    <Link
      to={`/category/${category?.slug}`}
      aria-label={`View category ${category?.name}`}
      className="block"
    >
      <div className="group text-center">
        {/* Circle Icon Container */}
        <div className={`relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition duration-300 bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
          {imageSrc ? (
            <img
              src={getImgSrc(imageSrc)}
              alt={category?.name || 'Category image'}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="text-6xl md:text-7xl">{category?.icon}</div>
          )}
          {/* Soft overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-20 group-hover:opacity-10 transition duration-300`}></div>
        </div>

        {/* Category Name */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-400 transition duration-300">
          {category?.name}
        </h3>

        {/* Product Count */}
        {/* <p className="text-sm md:text-base text-gray-600 font-semibold">
          {category?.productCount ?? 0}+ Products
        </p> */}
      </div>
    </Link>
  );
};

export default CategoryCard;
