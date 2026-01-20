import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaShoppingCart, FaArrowDown } from 'react-icons/fa';

const SliderComponent = ({ content = {} }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    const slides = content.slides || [
        {
            id: 1,
            title: 'Daily Grocery Order',
            description: 'Fresh products delivered to your doorstep',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 2,
            title: 'Electronics Sale',
            description: 'Best deals on latest gadgets',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=60'
        },
        {
            id: 3,
            title: 'Fashion Week',
            description: 'Latest trends and styles',
            image: 'https://plus.unsplash.com/premium_photo-1724220740325-5c95c8bfad59?w=600&auto=format&fit=crop&q=60'
        }
    ];

    useEffect(() => {
        if (!autoPlay) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setAutoPlay(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setAutoPlay(false);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setAutoPlay(false);
    };

    const handleScrollDown = () => {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full overflow-hidden">
            {/* Slider Container */}
            <div className="relative h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] w-full">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
                        }`}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200">
                            {slide.image && (
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                                <p className="text-lg md:text-2xl mb-8">{slide.description}</p>
                                <button className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2 mx-auto">
                                    <FaShoppingCart /> Shop Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition"
                    aria-label="Previous slide"
                >
                    <FaChevronLeft size={24} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition"
                    aria-label="Next slide"
                >
                    <FaChevronRight size={24} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition ${
                                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-3 hover:bg-white/75'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Scroll Down Indicator */}
            <button
                onClick={handleScrollDown}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white"
            >
                <FaArrowDown size={24} />
            </button>
        </div>
    );
};

export default SliderComponent;
