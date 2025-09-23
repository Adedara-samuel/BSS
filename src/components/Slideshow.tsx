'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ContentItem } from '@/types';

interface SlideshowProps {
    content: ContentItem[];
}

const Slideshow = ({ content }: SlideshowProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [content.length]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + content.length) % content.length);
    };

    if (!content || content.length === 0) {
        return null;
    }

    const currentItem = content[currentIndex];

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] rounded-xl overflow-hidden shadow-lg transition-all duration-1000">
            <Image
                src={currentItem.image}
                alt={currentItem.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-1000 ease-in-out"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#FFD700] mb-2">
                    {currentItem.title}
                </h2>
                <p className="text-lg text-gray-300">{currentItem.type.toUpperCase()}</p>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 text-white p-2 rounded-full hover:bg-white/50 transition-colors"
            >
                <FiChevronLeft size={24} />
            </button>
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 text-white p-2 rounded-full hover:bg-white/50 transition-colors"
            >
                <FiChevronRight size={24} />
            </button>
        </div>
    );
};

export default Slideshow;