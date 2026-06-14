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
  ChevronRightIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import type { StemPartnerPageConfig } from '@/types/page';

const iconMap: Record<string, React.ElementType> = {
  CalculatorIcon,
  BeakerIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon
};

interface StemPartnerProps {
  config: StemPartnerPageConfig;
}

export default function StemPartner({ config }: StemPartnerProps) {
  const { hero, initiative, programs, support, timeline, grant_callout, target_audience, contact } = config;

  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
      performSmoothScroll(contactRef.current.getBoundingClientRect().top + window.scrollY - navHeight);
    }
  };

  const scrollToContent = () => {
    if (contentRef.current) {
      performSmoothScroll(contentRef.current.getBoundingClientRect().top + window.scrollY);
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
    if (text === 'Riverside STEM Partner Program') {
      return (
        <>
          <span className={`${themeColors[0].text}`}>Riverside </span>
          <span className={`${themeColors[1].text}`}>STEM </span>
          <span className={`${themeColors[2].text}`}>Partner </span>
          <span className="text-neutral-900 dark:text-white block mt-2">Program</span>
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
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
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
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-neutral-500 hover:text-neutral-900 dark:text-white/80 dark:hover:text-white z-20 focus:outline-none transition-colors cursor-pointer"
              aria-label="Scroll down to content"
            >
              <ChevronDownIcon className="h-10 w-10 animate-bounce drop-shadow-md" />
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* CONTENT WRAPPER */}
      <div ref={contentRef} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[104px] md:pt-[120px] lg:pt-32 pb-8 md:pb-12 overflow-clip">

        {/* 2. The Initiative (Value Proposition) */}
        <section className="pt-0 pb-8 md:pb-16 flex flex-col items-center space-y-12">
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
            {target_audience.items.map((item, idx) => {
              const Icon = iconMap[item.icon] || UserGroupIcon;
              return (
                <div key={idx} className="bg-white dark:bg-neutral-800/50 p-8 rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center group hover:shadow-xl transition-all">
                  <div className={`w-16 h-16 rounded-full ${themeColors[idx % 3].bgLight} ${themeColors[idx % 3].text} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <p className="text-lg text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    {item.title}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* 4. Core Programs (Grid) */}
        <section className="py-8 md:py-16 space-y-12">
          {programs && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full text-center px-4"
              >
                <h2 className="text-sm font-bold tracking-widest text-orange-500 dark:text-orange-400 uppercase mb-4">{programs.title}</h2>
                <h3 className="text-4xl md:text-6xl font-extrabold text-blue-500 dark:text-blue-400 tracking-tighter">{programs.headline}</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-4"
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
                  <h4 className={`text-2xl font-extrabold ${theme.text} mb-4 tracking-tight`}>{item.title}</h4>
                  <div className="space-y-3">
                    <p className="text-neutral-600 dark:text-neutral-300 text-lg">{item.description}</p>
                  </div>
                </div>
              );
            })}

          </motion.div>
            </>
          )}
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
              <div className="absolute left-[2.25rem] -translate-x-px md:left-1/2 md:-translate-x-1/2 top-0 h-full w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

              {/* Animated Tracking Blue Line */}
              <motion.div
                className="absolute left-[2.25rem] -translate-x-px md:left-1/2 md:-translate-x-1/2 top-0 w-0.5 bg-blue-500 z-0 origin-top"
                style={{ height: lineHeight }}
              />

              <div className="relative z-10">
                <div className="space-y-0 relative z-10">
                  {timeline.levels.map((level, idx) => (
                    <motion.div
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-30%" }}
                      variants={{
                        hidden: {},
                        visible: {}
                      }}
                      className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group py-8"
                    >
                      {/* Dot */}
                      <div className="relative flex items-center justify-center w-10 h-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mt-6">
                        <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-800 shadow" />
                        <motion.div
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { duration: 0.3 } }
                          }}
                          className="absolute inset-0 rounded-full border-4 border-white dark:border-black bg-blue-500 flex items-center justify-center text-white text-xs font-black"
                        >
                          {level.level}
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
                        <span className="font-bold text-blue-500 dark:text-blue-400 text-sm tracking-wide uppercase">Level {level.level}</span>
                        <h4 className="text-xl font-bold text-green-500 dark:text-green-400 mt-2 mb-2">{level.title}</h4>
                        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{level.text}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Support & Grant Callout */}
        {(support || grant_callout) && (
          <section className="py-8 md:py-16 max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Left Pane: Our Support */}
              {support && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-200 dark:border-neutral-800 flex flex-col h-full"
                >
                  <h3 className="text-2xl md:text-3xl font-extrabold text-neutral-800 dark:text-white mb-8">{support.title}</h3>
                  <div className="flex flex-col space-y-4">
                    {support.items.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-300 text-base md:text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Right Pane: TAiSE Grant Callout */}
              {grant_callout && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-200 dark:border-neutral-800 flex flex-col h-full relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-white mb-4">{grant_callout.title}</h3>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed font-medium">
                      {grant_callout.body}
                    </p>
                    <div className="bg-neutral-200/50 dark:bg-neutral-700/50 rounded-2xl p-4 text-sm text-neutral-800 dark:text-neutral-200 italic font-medium">
                      {grant_callout.disclaimer}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* 9. Next Steps & Contact (Bottom) */}
        <section ref={contactRef} id="contact" className="pt-8 md:pt-16 pb-0">
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
