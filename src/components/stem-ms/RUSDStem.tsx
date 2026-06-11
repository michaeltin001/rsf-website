'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  CalculatorIcon,
  BeakerIcon,
  CpuChipIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import type { RUSDStemPageConfig } from '@/types/page';

const iconMap: Record<string, React.ElementType> = {
  CalculatorIcon,
  BeakerIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
};

interface RusdStemProps {
  config: RUSDStemPageConfig;
}

export default function RUSDStem({ config }: RusdStemProps) {
  const { hero, initiative, programs, contact } = config;

  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contactRef = useRef<HTMLDivElement>(null);
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

  const scrollToContact = () => {
    if (contactRef.current) {
      const navHeight = (window.innerWidth >= 1024 ? 64 : 56) + 16;
      performSmoothScroll(contactRef.current.offsetTop - navHeight);
    }
  };

  const scrollToContent = () => {
    if (contentRef.current) {
      performSmoothScroll(contentRef.current.offsetTop);
    }
  };

  const renderHeadline = (text: string) => {
    if (text === 'RUSD STEM MS Collaboration') {
      return (
        <>
          <span className="text-[#3b82f6] dark:text-[#60a5fa]">RUSD </span>
          <span className="text-[#22c55e] dark:text-[#4ade80]">STEM </span>
          <span className="text-[#f97316] dark:text-[#fb923c]">MS </span>
          <span className="text-white block mt-2">Collaboration</span>
        </>
      );
    }
    return text;
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative w-full h-screen -mt-14 lg:-mt-16 overflow-hidden shadow-2xl flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url("${hero.bg_image}")` }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />

        <AnimatePresence>
          {!scrolled && (
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
               transition={{ duration: 0.5 }}
               className="relative z-20 text-center px-6 md:px-12 py-10 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-glass w-full max-w-7xl mx-auto"
             >
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg mb-4 text-white">
                 {renderHeadline(hero.headline)}
               </h1>
               <p className="text-xl md:text-2xl text-neutral-200 font-medium tracking-wide mb-8">
                 {hero.sub_headline}
               </p>
               <button 
                 onClick={scrollToContact}
                 className="px-8 py-4 bg-accent hover:bg-accent-light text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
               >
                 {hero.cta_button}
               </button>
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
        
        {/* 2. The Initiative (Value Proposition) */}
        <section className="py-8 md:py-16 flex flex-col items-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full text-center space-y-6"
          >
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase">{initiative.title}</h2>
            <div className="text-4xl md:text-6xl font-extrabold text-primary tracking-tighter">
              {initiative.headline}
            </div>
            {initiative.paragraphs.map((p, idx) => (
              <p key={idx} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {p.includes('There are no mandatory commitments') ? (
                  <span dangerouslySetInnerHTML={{ __html: p.replace('There are no mandatory commitments, no rigid deadlines, and no hidden expectations.', '<strong class="text-accent font-semibold">There are no mandatory commitments, no rigid deadlines, and no hidden expectations.</strong>') }} />
                ) : (
                  p
                )}
              </p>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {initiative.partners.map((partner, idx) => (
              <a 
                href="#contact"
                key={idx} 
                className="group cursor-pointer flex flex-col h-full bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 border border-neutral-200 dark:border-neutral-800 transition-all duration-300"
              >
                <div className="relative w-full aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center text-neutral-500 transition-transform duration-500 group-hover:scale-105">
                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium tracking-wide uppercase text-sm">
                      {partner.short_name} Image
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex items-center justify-center text-center bg-white dark:bg-neutral-900 group-hover:bg-accent/5 dark:group-hover:bg-accent/5 transition-colors duration-300">
                  <h3 className="font-bold text-primary group-hover:text-accent transition-colors duration-300 text-lg">{partner.name}</h3>
                </div>
              </a>
            ))}
          </motion.div>
        </section>

        {/* 3. Core Programs (The Grid) */}
        <section className="py-8 md:py-16 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">{programs.title}</h2>
            <h3 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tighter">{programs.headline}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {programs.items.map((item, idx) => {
              const Icon = iconMap[item.icon] || CalculatorIcon;
              return (
                <div 
                  key={idx}
                  className="bg-neutral-50 dark:bg-neutral-800/50 p-8 md:p-10 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h4 className="text-2xl font-extrabold text-primary mb-4 tracking-tight">{item.title}</h4>
                  <div className="space-y-3">
                    <p className="text-neutral-600 dark:text-neutral-300 text-lg"><strong className="text-accent font-semibold">The Focus:</strong> {item.focus}</p>
                    <p className="text-neutral-600 dark:text-neutral-300 text-lg"><strong className="text-accent font-semibold">The Resources:</strong> {item.resources}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* 4. Next Steps & Contact (Bottom) */}
        <section ref={contactRef} id="contact" className="py-8 md:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-900 dark:bg-black text-white rounded-[3rem] p-10 md:p-16 lg:p-20 shadow-2xl relative overflow-hidden text-center mx-auto"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
            
            <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {contact.headline}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-neutral-300 leading-relaxed font-medium">
                {contact.body}
              </p>
              
              <div className="w-32 h-1 bg-accent mx-auto rounded-full my-8 opacity-50"></div>
              
              <div className="pt-4 text-xl md:text-2xl font-medium tracking-wide">
                Contact <span className="font-bold text-white">{contact.info.name}</span> at <br className="md:hidden" />
                <span className="font-bold text-accent">
                  {contact.info.email}
                </span>
                <br className="md:hidden" /> to inquire and get started.
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
