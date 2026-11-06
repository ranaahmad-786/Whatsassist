/**
 * WhatsAssist - Wireframe-Aligned Storefront Hero Carousel
 * Showcases flagship E-Bikes, Inverter ACs, and Smart Appliances with interactive controls.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import acGreeImg from '../assets/products/ac-gree.jpg';
import dawlanceMicroImg from '../assets/products/dawlance-microwave.jpg';

const SLIDES = [
  {
    id: 1,
    category: 'E-Bikes',
    tag: 'Flagship Zero-Petrol Mobility',
    title: 'ZepTech E-Bikes',
    subtitle: 'ZepTech E-Bikes & E-Mobility Store',
    description: '70 km per charge with high-torque brushless hub motor. Zero emissions, zero fuel cost, 1-year battery warranty.',
    cta: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    alt: 'ZepTech Thunder E-Bike Flagship',
    badge: 'Trending E-Mobility',
  },
  {
    id: 2,
    category: 'Air Conditioners',
    tag: '70% Energy Saver Inverter Tech',
    title: 'Smart Inverter ACs',
    subtitle: 'Dawlance & Gree T3 Compressor Units',
    description: 'Full DC inverter technology engineered for Pakistani extreme summer temperatures up to 52°C with low-voltage startup.',
    cta: 'Explore Cooling',
    image: acGreeImg,
    alt: 'Gree 1.5 Ton Inverter AC',
    badge: 'Summer Special',
  },
  {
    id: 3,
    category: 'Ovens & Kitchen',
    tag: 'Smart Microwave & Convection Deals',
    title: 'Dawlance Smart Kitchen',
    subtitle: 'Digital Air Fryer & Convection Ovens',
    description: 'Even heat circulation, digital recipe presets, and rust-resistant cavity for modern Pakistani homes.',
    cta: 'View Kitchen Deals',
    image: dawlanceMicroImg,
    alt: 'Dawlance Convection Microwave Oven',
    badge: 'Popular Choice',
  },
];

export default function StorefrontHero({ onSelectCategory, onShopNow }) {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[360px]">
        {/* Left Content */}
        <div className="flex-1 max-w-xl z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-emerald-400 text-xs font-bold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.tag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {slide.title}
          </h2>

          <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mt-1">
            {slide.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed hidden sm:block">
            {slide.description}
          </p>

          <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(slide.category);
                if (onShopNow) onShopNow();
              }}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>{slide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Hero Product Image */}
        <div className="flex-1 w-full max-w-md flex items-center justify-center relative z-10">
          <div className="relative group">
            <div className="w-64 h-52 sm:w-80 sm:h-64 lg:w-96 lg:h-72 rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 p-3 shadow-md border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.alt}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = acGreeImg;
                }}
                className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Overlay Tag */}
            <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
              {slide.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Carousel Footer Controls matching Wireframe */}
      <div className="px-6 py-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i
                  ? 'w-6 bg-slate-900 dark:bg-emerald-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation (< 2 >) matching Wireframe */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevSlide}
            className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 px-1.5">
            {current + 1} / {SLIDES.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
