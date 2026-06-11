'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  BuildingLibraryIcon, 
  UserGroupIcon, 
  CpuChipIcon, 
  SparklesIcon,
  AcademicCapIcon, 
  BeakerIcon,      
  HeartIcon,       
  BriefcaseIcon    
} from '@heroicons/react/24/outline';
import type { Initiative, HeroSection, AboutSection, ImpactSection, VolunteerSection } from '@/types/home';

// Icon Map for dynamic icon rendering
const iconMap: Record<string, React.ElementType> = {
  BuildingLibraryIcon,
  CpuChipIcon,
  UserGroupIcon,
  SparklesIcon,
  AcademicCapIcon, 
  BeakerIcon,      
  HeartIcon,       
  BriefcaseIcon
};

interface HeroProps {
  hero: HeroSection;
  about: AboutSection;
  impact: ImpactSection;
  initiatives: Initiative[];
  volunteer: VolunteerSection;
}

export default function Hero({ hero, about, impact, initiatives, volunteer }: HeroProps) {
  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === initiatives.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? initiatives.length - 1 : prev - 1));
  };

  const performSmoothScroll = (targetPos: number) => {
    isSnapping.current = true; // Raise the shield
    window.scrollTo({ top: targetPos, behavior: 'smooth' });

    let lastY = window.scrollY;
    let idleTicks = 0;

    const checkIfScrollFinished = setInterval(() => {
      const currentY = window.scrollY;
      if (Math.abs(currentY - targetPos) < 2) {
        clearInterval(checkIfScrollFinished);
        isSnapping.current = false;
      } 
      else if (currentY === lastY) {
        idleTicks++;
        if (idleTicks >= 2) {
          clearInterval(checkIfScrollFinished);
          isSnapping.current = false;
        }
      } 
      else {
        idleTicks = 0;
      }

      lastY = currentY;
    }, 50);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 100);

      if (!isSnapping.current && contentRef.current) {
        const targetY = contentRef.current.offsetTop;
        if (currentScrollY > 25 && currentScrollY < targetY - 5 && currentScrollY > lastScrollY) {
          performSmoothScroll(targetY);
        }
        else if (currentScrollY < targetY - 1 && currentScrollY > 5 && currentScrollY < lastScrollY) {
          performSmoothScroll(0);
        }
      }
      
      lastScrollY = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    if (contentRef.current) {
      performSmoothScroll(contentRef.current.offsetTop);
    }
  };

  return (
    <div className="w-full">
      
      {/* HERO BANNER */}
      <section 
        className="relative w-full h-screen -mt-14 lg:-mt-16 overflow-hidden shadow-2xl flex items-center justify-center"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url("${hero?.backgroundImage}")` }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />

        <AnimatePresence>
          {!scrolled && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
              className="relative z-20 text-center px-8 py-10 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-glass"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
                {hero?.title}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!scrolled && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              onClick={scrollToContent}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/80 hover:text-white z-20 focus:outline-none transition-colors"
              aria-label="Scroll down to content"
            >
              <ChevronDownIcon className="h-10 w-10 animate-bounce drop-shadow-md" />
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* CONTENT WRAPPER */}
      <div ref={contentRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">

        {/* 1. ABOUT SECTION (Split Layout: Zig-Zag Reversed) */}
        <section id="about-us" className="py-8 md:py-16">
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 space-y-6"
            >
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase">
                {about?.title}
              </h2>
              <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter">
                {about?.headline}
              </div>
              <p 
                className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: about?.content ?? '' }}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800 group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center text-neutral-500 transition-transform duration-500 group-hover:scale-105">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium tracking-wide uppercase text-sm">
                    {about?.imagePlaceholder}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 2. IMPACT SECTION (Split Layout: Metric + Category Grid) */}
        <section id="our-impact" className="py-8 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 space-y-6"
            >
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase">
                {impact?.title}
              </h2>
              <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter">
                {impact?.headlinePrefix}<span className="text-accent">{impact?.headlineHighlight}</span>
              </div>
              <p 
                className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: impact?.content ?? '' }}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
            >
              {impact?.metrics?.map((metric, idx) => {
                const Icon = iconMap[metric.icon] || SparklesIcon;
                return (
                  <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                    <Icon className="h-8 w-8 text-accent mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">{metric.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{metric.description}</p>
                  </div>
                );
              })}
            </motion.div>

          </div>
        </section>

        {/* 3. INITIATIVES CAROUSEL – now data‑driven */}
        <section id="initiatives" className="py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-7xl mx-auto mb-4 px-4"
          >
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase">Initiatives</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-7xl mx-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-full text-center mb-4 md:mb-6 px-4">
                  <h3 className="font-extrabold text-3xl md:text-4xl lg:text-5xl text-primary tracking-tight">
                    {initiatives[currentSlide]?.title ?? 'Untitled'}
                  </h3>
                </div>

                <div className="w-full aspect-video md:aspect-[24/9] rounded-3xl relative group overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center text-neutral-500 transition-transform duration-700 group-hover:scale-105">
                    <svg className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium tracking-wide uppercase text-sm md:text-base pb-12">
                      [{initiatives[currentSlide]?.title ?? 'Initiative'} Image]
                    </span>
                  </div>

                  <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-11/12 max-w-4xl p-4 md:p-6 rounded-2xl backdrop-blur-md bg-white/75 dark:bg-black/60 border border-white/30 dark:border-white/10 shadow-lg text-center transition-all duration-300">
                    <p className="text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                      {initiatives[currentSlide]?.content ?? ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center items-center gap-6 mt-4 md:mt-6">
              <button
                onClick={prevSlide}
                className="p-2 text-neutral-400 dark:text-neutral-500 opacity-50 hover:opacity-100 hover:text-accent dark:hover:text-accent hover:-translate-x-1 transition-all focus:outline-none flex-shrink-0"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="h-6 w-6 md:h-8 md:w-8" />
              </button>

              <div className="flex justify-center items-center space-x-3">
                {initiatives.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === index
                        ? 'w-8 h-2.5 bg-accent'
                        : 'w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 text-neutral-400 dark:text-neutral-500 opacity-50 hover:opacity-100 hover:text-accent dark:hover:text-accent hover:translate-x-1 transition-all focus:outline-none flex-shrink-0"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* 4. VOLUNTEER / CTA SECTION */}
        <section id="volunteer" className="py-8 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 space-y-6"
            >
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase">
                {volunteer?.title}
              </h2>
              <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter leading-tight">
                {volunteer?.headline}
              </div>
              <p 
                className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: volunteer?.content ?? '' }}
              />
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-light shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  {volunteer?.buttonPrimary}
                </button>
                <button className="px-6 py-3 bg-white dark:bg-neutral-800 text-primary dark:text-white text-sm font-semibold rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:border-accent dark:hover:border-accent transition-all hover:-translate-y-0.5">
                  {volunteer?.buttonSecondary}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800 group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center text-neutral-500 transition-transform duration-500 group-hover:scale-105">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium tracking-wide uppercase text-sm">
                    {volunteer?.imagePlaceholder}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

      </div>
    </div>
  );
}
