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

// --- REAL DATA ---

const initiativesData = [
  { 
    title: "Community Partnerships", 
    content: "Backing STEM outreach, civic leadership projects, and program development. This includes public showcases and creating innovative programs through dedicated training and planning initiatives." 
  },
  { 
    title: "First Lego Robotics", 
    content: "Promoting the development of immersive Robotics Programs within RUSD, with a strong focus on fostering inclusion, hands-on collaboration, and lasting community partnerships." 
  },
  { 
    title: "MS & HS Experience", 
    content: "Enhancing the day-to-day lives of middle and high school students. From funding ASB equipment to helping establish popular new clubs, we directly support the student experience." 
  },
  { 
    title: "Grant Writing", 
    content: "Supporting the foundation in securing vital funding through dedicated grant writing initiatives, perfectly aligned with the shared mission and vision of RSF and RUSD." 
  },
  { 
    title: "Green Solutions", 
    content: "Providing resources for campus Green Teams to promote environmentally conscious behaviors. We aim to develop student leadership and inspire action in sustainable green solutions." 
  }
];

export default function Hero() {
  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === initiativesData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? initiativesData.length - 1 : prev - 1));
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
      
      {/* HERO BANNER */}
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

      {/* CONTENT WRAPPER */}
      <div ref={contentRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                About Us
              </h2>
              <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter">
                Est. 2016
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-500 leading-relaxed">
                The Riverside STEM Foundation (RSF) is a registered <span className="text-accent font-semibold">501(c)(3) non-profit</span> corporation dedicated to supporting STEM education across the Inland Empire region.
                <br/><br/>
                Our Board of Directors is a diverse coalition united by a single goal: empowering the next generation of innovators.
              </p>
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
                    [Board of Directors Image]
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
                Our Impact
              </h2>
              <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter">
                $300k<span className="text-accent">+</span>
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-500 leading-relaxed">
                Through developing partnerships with the Riverside community and beyond, applying for grants, and engaging interested donors, the Riverside STEM Foundation has raised over $300,000. 
                <br/><br/>
                This funding has been directly reinvested into our community to support various vital educational and infrastructure initiatives.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
            >
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                <BuildingLibraryIcon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">School Infrastructure</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-500">Funding major campus projects to create better learning environments.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                <CpuChipIcon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">Educational Tech</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-500">Supplying modern tools like solar-powered greenhouses and C-STEM robots.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                <UserGroupIcon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">Student Activities</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-500">Sponsoring and expanding extracurriculars like Robotics and Chess clubs.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                <SparklesIcon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">Community Events</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-500">Supporting teacher development and hosting events like Innovate Riverside.</p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 3. INITIATIVES CAROUSEL */}
        <section id="our-initiatives" className="py-8 md:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-7xl mx-auto mb-4 px-4"
          >
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase">
              Our Initiatives
            </h2>
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
                    {initiativesData[currentSlide].title}
                  </h3>
                </div>

                <div className="w-full aspect-video md:aspect-[24/9] rounded-3xl relative group overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center text-neutral-500 transition-transform duration-700 group-hover:scale-105">
                    <svg className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium tracking-wide uppercase text-sm md:text-base pb-12">
                      [{initiativesData[currentSlide].title} Image]
                    </span>
                  </div>

                  <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-11/12 max-w-4xl p-4 md:p-6 rounded-2xl backdrop-blur-md bg-white/75 dark:bg-black/60 border border-white/30 dark:border-white/10 shadow-lg text-center transition-all duration-300">
                    <p className="text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-500 leading-relaxed font-medium">
                      {initiativesData[currentSlide].content}
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
                {initiativesData.map((_, index) => (
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

        {/* 4. GET INVOLVED / CTA SECTION */}
        <section id="get-involved" className="py-8 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 space-y-6"
            >
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase">
                Get Involved
              </h2>
              <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter leading-tight">
                Connect
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-500 leading-relaxed">
                We welcome your creative ideas for grant proposals, symposium speakers, and <span className="text-accent font-semibold">community partnerships</span>. If you have expertise in fundraising, grant writing, or non-profit work that you'd like to share, we would greatly appreciate it. 
                Additionally, if you're interested in making a <span className="text-accent font-semibold">tax-deductible donation</span> to support RSF's mission, please reach out!
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-light shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  Contact Us
                </button>
                <button className="px-6 py-3 bg-white dark:bg-neutral-800 text-primary dark:text-white text-sm font-semibold rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:border-accent dark:hover:border-accent transition-all hover:-translate-y-0.5">
                  Donate Now
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
                    [Community Partnership Image]
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
