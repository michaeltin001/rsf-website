'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// --- PLACEHOLDER DATA ---

const threeCardsData = [
  {
    title: "STEM Education",
    content: "Providing cutting-edge resources and curriculum to schools across the Inland Empire.",
    image: "https://images.unsplash.com/photo-scale-placeholder-1" // Placeholder
  },
  {
    title: "Community Outreach",
    content: "Engaging parents, educators, and leaders to foster a culture of scientific curiosity.",
    image: "https://images.unsplash.com/photo-scale-placeholder-2" // Placeholder
  },
  {
    title: "Scholarship Programs",
    content: "Supporting the next generation of scientists and engineers with direct financial aid.",
    image: "https://images.unsplash.com/photo-scale-placeholder-3" // Placeholder
  }
];

const sixCardsData = [
  { title: "Our Mission", content: "To bridge the educational gap and ensure equitable access to STEM resources for all students." },
  { title: "2016 Founding", content: "Established by a coalition of passionate educators, scientists, and philanthropists." },
  { title: "Teacher Grants", content: "We provide direct funding to educators looking to bring innovative projects to their classrooms." },
  { title: "Science Fairs", content: "Sponsoring and organizing regional competitions to showcase student talent and hard work." },
  { title: "Mentorship", content: "Connecting high school students with industry professionals in the Riverside tech corridor." },
  { title: "Future Goals", content: "Expanding our reach to serve over 50,000 students annually by the end of the decade." }
];

export default function Hero() {
  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const performSmoothScroll = (targetPos: number) => {
    isSnapping.current = true; // Raise the shield
    window.scrollTo({ top: targetPos, behavior: 'smooth' });

    const checkIfScrollFinished = setInterval(() => {
      if (Math.abs(window.scrollY - targetPos) < 2) {
        clearInterval(checkIfScrollFinished);
        isSnapping.current = false;
      }
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
        if (currentScrollY > 150 && currentScrollY < targetY - 5 && currentScrollY > lastScrollY) {
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
      
      <section 
        className="relative w-full h-screen -mt-14 lg:-mt-16 overflow-hidden shadow-2xl flex items-center justify-center"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop")' }}
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
                Riverside STEM Foundation
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

      <div ref={contentRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12 pt-12">
        
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {threeCardsData.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col"
              >
                <div className="h-48 bg-neutral-200 dark:bg-neutral-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-neutral-500">
                    [Image Placeholder]
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-semibold text-primary mb-3">{card.title}</h3>
                  <p className="text-base text-neutral-600 dark:text-neutral-500 leading-relaxed">
                    {card.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 gap-8">
            {sixCardsData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col md:flex-row md:min-h-[350px]"
              >
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="font-semibold text-2xl text-primary mb-4 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-base text-neutral-600 dark:text-neutral-500 mb-8 flex-grow">
                    {item.content}
                  </p>
                  <div>
                    <button className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-light transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-1/2 h-80 md:h-auto bg-neutral-200 dark:bg-neutral-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-neutral-500">
                    [Image Placeholder]
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
