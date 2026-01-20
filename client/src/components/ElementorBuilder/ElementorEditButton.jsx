import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { useElementorBuilder } from '../../context/ElementorBuilderContext';

/**
 * EditButton - Toggle Elementor builder on/off
 * Shows when user is authenticated as admin
 */
const ElementorEditButton = ({ pageName = 'home' }) => {
  const { toggleEditMode } = useElementorBuilder();

  const handleClick = () => {
    toggleEditMode(pageName);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-40 bg-gray-800 hover:bg-black text-white p-4 rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-110"
      title={`Edit ${pageName} page`}
      aria-label="Edit page"
    >
      <FaEdit size={20} />
    </button>
  );
};

export default ElementorEditButton;
