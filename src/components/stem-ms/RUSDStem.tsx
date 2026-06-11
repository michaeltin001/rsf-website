'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalculatorIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  PresentationChartBarIcon,
  AcademicCapIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import type { RUSDStemPageConfig } from '@/types/page';

// Icon Map for dynamic icon rendering
const iconMap: Record<string, React.ElementType> = {
  CalculatorIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  PresentationChartBarIcon,
};

interface RusdStemProps {
  config: RUSDStemPageConfig;
}

export default function RUSDStem({ config }: RusdStemProps) {
  const { header, our_program, programs, involvement, contact } = config;

  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
        const navHeight = window.innerWidth >= 1024 ? 64 : 56;
        const targetY = contentRef.current.offsetTop - navHeight;
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
      const navHeight = window.innerWidth >= 1024 ? 64 : 56;
      performSmoothScroll(contentRef.current.offsetTop - navHeight);
    }
  };

  return (
    <div className="w-full">
      {/* 1. HERO / HEADER SECTION */}
      <section className="relative w-full h-screen -mt-14 lg:-mt-16 overflow-hidden bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 shadow-sm border-b border-neutral-200 dark:border-neutral-800 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 md:space-y-12">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter">
              <span className="text-[#1e4b6b] dark:text-[#5aa5d7]">RUSD </span>
              <span className="text-[#2a7b45] dark:text-[#42ad66]">STEM </span>
              <span className="text-[#d97c2b] dark:text-[#e8954d]">MS </span>
              <span className="text-primary block mt-2 md:mt-4">Collaboration</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 md:space-y-6"
          >
            <p className="text-neutral-500 dark:text-neutral-400 font-medium tracking-widest uppercase text-sm md:text-base">
              {header.partnership_text}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto pt-4">
              {header.partners.map((partner, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-full aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-700 relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e4b6b]/20 to-[#2a7b45]/20 dark:from-[#5aa5d7]/20 dark:to-[#42ad66]/20 flex flex-col items-center justify-center text-neutral-500 transition-transform duration-500 group-hover:scale-105">
                      <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium tracking-wide uppercase text-xs text-center px-2">
                        {partner} Image
                      </span>
                    </div>
                  </div>
                  <div className="text-base md:text-lg font-bold text-neutral-800 dark:text-neutral-200 text-center transition-colors group-hover:text-[#1e4b6b] dark:group-hover:text-[#5aa5d7]">
                    {partner}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        <AnimatePresence>
          {!scrolled && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              onClick={scrollToContent}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-neutral-400 hover:text-primary dark:text-neutral-500 dark:hover:text-white z-20 focus:outline-none transition-colors"
              aria-label="Scroll down to content"
            >
              <ChevronDownIcon className="h-10 w-10 animate-bounce drop-shadow-md" />
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* CONTENT WRAPPER */}
      <div ref={contentRef} className="w-full overflow-hidden">
        {/* 2. OUR PROGRAM SECTION */}
        <section className="py-16 md:py-24 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 md:space-y-8"
            >
              <h2 className="text-sm font-bold tracking-widest text-[#d97c2b] uppercase">
                {our_program.title}
              </h2>
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1e4b6b] dark:text-[#5aa5d7] tracking-tight leading-tight">
                {our_program.headline}
              </div>
              <div className="w-24 h-1 bg-[#2a7b45] dark:bg-[#42ad66] mx-auto rounded-full"></div>
              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mx-auto max-w-3xl">
                {our_program.content}
              </p>
            </motion.div>
          </div>
        </section>

        {/* 3. PROGRAMS SECTION */}
        <section className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="inline-block px-8 py-3 bg-white dark:bg-neutral-900 rounded-2xl text-2xl md:text-4xl font-extrabold text-primary tracking-tight border border-neutral-200 dark:border-neutral-800 shadow-sm uppercase">
              {programs.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto">
            {programs.items.map((program, idx) => {
              const Icon = iconMap[program.icon] || AcademicCapIcon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[#eef5fa] dark:bg-[#1a2b38] border border-[#d6e6f2] dark:border-[#243d50] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e4b6b] group-hover:border-[#1e4b6b] transition-all duration-500">
                    <Icon className="w-10 h-10 text-[#1e4b6b] dark:text-[#5aa5d7] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl md:text-2xl font-extrabold text-primary mb-3 uppercase tracking-tight">
                      {program.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      {program.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 4. INVOLVEMENT / CONTACT SECTION */}
        <section className="py-16 md:py-24 bg-gradient-to-t from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-950 border-t border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#1e4b6b] text-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d97c2b] opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>

              <div className="relative z-10">
                <div className="inline-block px-6 py-2 bg-[#d97c2b] text-white font-extrabold tracking-widest text-sm rounded-full mb-8 shadow-md uppercase">
                  {involvement.title}
                </div>

                <h2 className="text-3xl md:text-5xl font-extrabold mb-10 tracking-tight uppercase leading-tight text-white/95">
                  {involvement.headline}
                </h2>

                <div className="w-full h-px bg-white/20 mb-10 max-w-md mx-auto"></div>

                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold tracking-widest uppercase text-white/80">
                    {contact.title}
                  </h3>
                  <p className="text-xl md:text-2xl font-medium text-white">
                    Contact <span className="font-extrabold text-[#d97c2b]">{contact.name}</span> at{' '}
                    <a href={`mailto:${contact.email}`} className="underline decoration-[#d97c2b] underline-offset-4 hover:text-[#d97c2b] transition-colors">
                      {contact.email}
                    </a>
                  </p>
                  <p className="text-lg text-white/80">
                    to get started and learn more.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

      </div>
    </div>
  );
}
