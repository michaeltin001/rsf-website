'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import {
  ChevronDownIcon,
  CalculatorIcon,
  BeakerIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
  const { hero, initiative, programs, resources, timeline, faq, contact } = config;

  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = () => {
    if (!resources?.slides) return;
    setCurrentSlide((prev) => (prev === resources.slides.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    if (!resources?.slides) return;
    setCurrentSlide((prev) => (prev === 0 ? resources.slides.length - 1 : prev - 1));
  };

  const [activeProgramIndex, setActiveProgramIndex] = useState(0);
  const [hasSwitchedTabs, setHasSwitchedTabs] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineScrollProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 80%"]
  });

  const maxTimelineProgress = useMotionValue(0);
  useEffect(() => {
    return timelineScrollProgress.on("change", (latest) => {
      if (latest > maxTimelineProgress.get()) {
        maxTimelineProgress.set(latest);
      }
    });
  }, [timelineScrollProgress, maxTimelineProgress]);


  const lineHeight = useTransform(maxTimelineProgress, [0, 1], ["0%", "100%"]);

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

  const themeColors = [
    {
      text: "text-blue-500 dark:text-blue-400",
      hoverText: "group-hover:text-blue-500 dark:group-hover:text-blue-400",
      bgLight: "bg-blue-500/10 dark:bg-blue-400/10",
      hoverBgLight: "group-hover:bg-blue-500/5 dark:group-hover:bg-blue-400/5",
      gradient: "from-transparent to-blue-500/20 dark:to-blue-400/20",
      glowBg: "bg-blue-500"
    },
    {
      text: "text-green-500 dark:text-green-400",
      hoverText: "group-hover:text-green-500 dark:group-hover:text-green-400",
      bgLight: "bg-green-500/10 dark:bg-green-400/10",
      hoverBgLight: "group-hover:bg-green-500/5 dark:group-hover:bg-green-400/5",
      gradient: "from-transparent to-green-500/20 dark:to-green-400/20",
      glowBg: "bg-green-500"
    },
    {
      text: "text-orange-500 dark:text-orange-400",
      hoverText: "group-hover:text-orange-500 dark:group-hover:text-orange-400",
      bgLight: "bg-orange-500/10 dark:bg-orange-400/10",
      hoverBgLight: "group-hover:bg-orange-500/5 dark:group-hover:bg-orange-400/5",
      gradient: "from-transparent to-orange-500/20 dark:to-orange-400/20",
      glowBg: "bg-orange-500"
    }
  ];

  const renderHeadline = (text: string) => {
    if (text === 'RUSD STEM MS Collaboration') {
      return (
        <>
          <span className={`${themeColors[0].text}`}>RUSD </span>
          <span className={`${themeColors[1].text}`}>STEM </span>
          <span className={`${themeColors[2].text}`}>MS </span>
          <span className="text-neutral-900 dark:text-white block mt-2">Collaboration</span>
        </>
      );
    }
    return text;
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative w-full h-screen -mt-14 lg:-mt-16 overflow-hidden shadow-2xl flex items-center justify-center">

        {/* Subtle CSS Dot Matrix Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-[0.15] bg-[radial-gradient(#000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
              className="relative z-20 w-full max-w-7xl mx-auto rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-3xl backdrop-saturate-200"
            >
              {/* 1. The Synced Glowing Hue (Blurred and positioned behind) */}
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-50 dark:opacity-40 -z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#3b82f6,#22c55e,#f97316,#3b82f6)]" />
                </div>
              </div>

              {/* 2. Animated Border (Masked to only show a 2px stroke) */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                style={{
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              >
                <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#3b82f6,#22c55e,#f97316,#3b82f6)] opacity-100" />
              </div>

              {/* 3. Inner Content Wrapper */}
              <div className="relative z-10 w-full h-full text-center px-6 md:px-12 py-10 rounded-2xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg mb-4 text-neutral-900 dark:text-white">
                  {renderHeadline(hero.headline)}
                </h1>
                <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 font-medium tracking-wide mb-8">
                  {hero.sub_headline}
                </p>
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  {hero.cta_button}
                </button>
              </div>
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
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-neutral-500 hover:text-neutral-900 dark:text-white/80 dark:hover:text-white z-20 focus:outline-none transition-colors"
              aria-label="Scroll down to content"
            >
              <ChevronDownIcon className="h-10 w-10 animate-bounce drop-shadow-md" />
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* CONTENT WRAPPER */}
      <div ref={contentRef} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-clip">

        {/* 2. The Initiative (Value Proposition) */}
        <section className="py-8 md:py-16 flex flex-col items-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full text-center space-y-6"
          >
            <h2 className="text-sm font-bold tracking-widest text-orange-500 dark:text-orange-400 uppercase">{initiative.title}</h2>
            <div className="text-4xl md:text-6xl font-extrabold text-blue-500 dark:text-blue-400 tracking-tighter">
              {initiative.headline}
            </div>
            {initiative.paragraphs.map((p, idx) => (
              <p key={idx} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {p.includes('There are no mandatory commitments') ? (
                  <span dangerouslySetInnerHTML={{ __html: p.replace('There are no mandatory commitments, no rigid deadlines, and no hidden expectations.', '<strong class="text-green-500 dark:text-green-400 font-semibold">There are no mandatory commitments, no rigid deadlines, and no hidden expectations.</strong>') }} />
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
            {initiative.partners.map((partner, idx) => {
              // Use Blue theme for all partner cards
              const theme = themeColors[0];
              return (
                <a
                  href="#contact"
                  key={idx}
                  className="group cursor-pointer flex flex-col h-full bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 border border-neutral-200 dark:border-neutral-800 transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center text-neutral-500 transition-transform duration-500 group-hover:scale-105`}>
                      <svg className={`w-12 h-12 mb-3 opacity-50 ${theme.hoverText} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium tracking-wide uppercase text-sm">
                        {partner.short_name} Image
                      </span>
                    </div>
                  </div>
                  <div className={`p-6 flex-grow flex items-center justify-center text-center bg-white dark:bg-neutral-900 ${theme.hoverBgLight} transition-colors duration-300`}>
                    <h3 className={`font-bold ${themeColors[1].text} transition-colors duration-300 text-lg`}>{partner.name}</h3>
                  </div>
                </a>
              );
            })}
          </motion.div>
        </section>



        {/* 4. The Curriculum (Carousel & Grid) */}
        <section className="py-8 md:py-16 space-y-12">
          {resources && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full text-center px-4"
              >
                <h2 className="text-sm font-bold tracking-widest text-orange-500 dark:text-orange-400 uppercase mb-4">The Curriculum</h2>
                <h3 className="text-4xl md:text-6xl font-extrabold text-blue-500 dark:text-blue-400 tracking-tighter">{resources.headline}</h3>
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
                    <div className="w-full aspect-video md:aspect-[24/9] rounded-3xl relative group overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800">
                      <div className={`absolute inset-0 bg-neutral-200 dark:bg-neutral-800 bg-gradient-to-br ${themeColors[0].gradient} flex flex-col items-center justify-center text-neutral-500 transition-transform duration-700 group-hover:scale-105`}>
                        <svg className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium tracking-wide uppercase text-sm md:text-base pb-12">
                          {resources.slides[currentSlide]?.diagramText}
                        </span>
                      </div>

                      <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-11/12 max-w-4xl p-4 md:p-6 rounded-2xl backdrop-blur-md bg-white/75 dark:bg-black/60 border border-white/30 dark:border-white/10 shadow-lg text-center transition-all duration-300">
                        <h3 className="font-extrabold text-xl md:text-2xl text-green-500 dark:text-green-400 tracking-tight mb-1">
                          {resources.slides[currentSlide]?.title}
                        </h3>
                        <p className="text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                          {resources.slides[currentSlide]?.subtitle}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center items-center gap-6 mt-4 md:mt-6">
                  <button
                    onClick={prevSlide}
                    className="p-2 text-neutral-400 dark:text-neutral-500 opacity-50 hover:opacity-100 hover:text-blue-500 dark:hover:text-blue-400 hover:-translate-x-1 transition-all focus:outline-none flex-shrink-0"
                    aria-label="Previous slide"
                  >
                    <ChevronLeftIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </button>

                  <div className="flex justify-center items-center space-x-3">
                    {resources.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full ${currentSlide === index
                          ? 'w-8 h-2.5 bg-blue-500'
                          : 'w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-2 text-neutral-400 dark:text-neutral-500 opacity-50 hover:opacity-100 hover:text-blue-500 dark:hover:text-blue-400 hover:translate-x-1 transition-all focus:outline-none flex-shrink-0"
                    aria-label="Next slide"
                  >
                    <ChevronRightIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {/* 3. Core Programs (The Grid) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {programs.items.map((item, idx) => {
              const Icon = iconMap[item.icon] || CalculatorIcon;
              // Use Green theme for all cards as requested
              const theme = themeColors[1];
              return (
                <div
                  key={idx}
                  className="bg-neutral-50 dark:bg-neutral-800/50 p-8 md:p-10 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className={`w-16 h-16 ${themeColors[0].bgLight} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${themeColors[0].text}`} />
                  </div>
                  <h4 className={`text-2xl font-extrabold ${themeColors[0].text} mb-4 tracking-tight`}>{item.title}</h4>
                  <div className="space-y-3">
                    <p className="text-neutral-600 dark:text-neutral-300 text-lg"><strong className={`${theme.text} font-semibold`}>The Focus:</strong> {item.focus}</p>
                    <p className="text-neutral-600 dark:text-neutral-300 text-lg"><strong className={`${theme.text} font-semibold`}>The Resources:</strong> {item.resources}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* 5. Season at a Glance (Interactive Timeline) */}
        {timeline && (
          <section className="py-8 md:py-16 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full text-center px-4"
            >
              <h2 className="text-sm font-bold tracking-widest text-orange-500 dark:text-orange-400 uppercase mb-4">{timeline.headline}</h2>
              <h3 className="text-4xl md:text-6xl font-extrabold text-blue-500 dark:text-blue-400 tracking-tighter">{timeline.sub_headline}</h3>
            </motion.div>

            <div className="relative max-w-4xl mx-auto px-4" ref={timelineRef}>
              {/* Background Gray Line */}
              <div className="absolute left-[1.25rem] -translate-x-px md:left-1/2 md:-translate-x-1/2 top-0 h-full w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

              {/* Animated Tracking Blue Line */}
              <motion.div
                className="absolute left-[1.25rem] -translate-x-px md:left-1/2 md:-translate-x-1/2 top-0 w-0.5 bg-blue-500 z-0 origin-top"
                style={{ height: lineHeight }}
              />

              <div className="relative z-10 grid">
                {timeline.programs.map((program, pIdx) => {
                  const isActive = activeProgramIndex === pIdx;
                  return (
                    <motion.div
                      key={pIdx}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 15,
                        zIndex: isActive ? 10 : 0
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`col-start-1 row-start-1 ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    >
                      <div className="space-y-0 relative z-10">
                        {program.items.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial="hidden"
                            animate={hasSwitchedTabs ? "visible" : undefined}
                            whileInView="visible"
                            viewport={{ once: true, margin: "-20%" }}
                            variants={{
                              hidden: {},
                              visible: {}
                            }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-8"
                          >
                            {/* Dot */}
                            <div className="relative flex items-center justify-center w-10 h-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                              <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-800 shadow" />
                              <motion.div
                                variants={{
                                  hidden: { opacity: 0 },
                                  visible: { opacity: 1, transition: { duration: 0.3 } }
                                }}
                                className="absolute inset-0 rounded-full border-4 border-white dark:border-black bg-blue-500 flex items-center justify-center"
                              >
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </motion.div>
                            </div>

                            {/* Card */}
                            <motion.div
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
                              }}
                              className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800"
                            >
                              <span className="font-bold text-blue-500 dark:text-blue-400 text-sm tracking-wide uppercase">{item.period}</span>
                              <h4 className="text-xl font-bold text-green-500 dark:text-green-400 mt-2 mb-2">{item.title}</h4>
                              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.description}</p>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-4 px-4 pt-4"
            >
              {timeline.programs.map((prog, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveProgramIndex(idx);
                    setHasSwitchedTabs(true);
                  }}
                  className={`px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 ${activeProgramIndex === idx
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  {prog.name}
                </button>
              ))}
            </motion.div>
          </section>
        )}

        {/* 6. Frequently Asked Questions */}
        {faq && (
          <section className="py-8 md:py-16 max-w-7xl mx-auto px-4 space-y-12">

            <div className="space-y-4">
              {faq.items.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white pr-4">
                        {item.question}
                      </span>
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                        <ChevronDownIcon className="w-5 h-5" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Next Steps & Contact (Bottom) */}
        <section ref={contactRef} id="contact" className="py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-900 dark:bg-black text-white rounded-[3rem] p-10 md:p-16 lg:p-20 shadow-2xl relative overflow-hidden text-center mx-auto"
          >
            {/* Background Decorations */}
            <div className={`absolute top-0 right-0 w-96 h-96 ${themeColors[0].glowBg} opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4`}></div>
            <div className={`absolute bottom-0 left-0 w-96 h-96 ${themeColors[1].glowBg} opacity-20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4`}></div>
            <div className={`absolute top-1/2 left-1/2 w-96 h-96 ${themeColors[2].glowBg} opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2`}></div>

            <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {contact.headline}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-neutral-300 leading-relaxed font-medium">
                {contact.body}
              </p>

              <div className="flex justify-center space-x-2 my-8">
                <div className={`w-10 h-1 ${themeColors[0].glowBg} rounded-full opacity-50`}></div>
                <div className={`w-10 h-1 ${themeColors[1].glowBg} rounded-full opacity-50`}></div>
                <div className={`w-10 h-1 ${themeColors[2].glowBg} rounded-full opacity-50`}></div>
              </div>

              <div className="pt-4 text-xl md:text-2xl font-medium tracking-wide">
                Contact <span className={`font-bold ${themeColors[1].text}`}>{contact.info.name}</span> at <br className="md:hidden" />
                <span className={`font-bold ${themeColors[1].text}`}>
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
