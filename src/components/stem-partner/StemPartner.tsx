'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import {
  ChevronDownIcon,
  CalculatorIcon,
  BeakerIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { StemPartnerPageConfig } from '@/types/page';
import { parseMarkdown } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  CalculatorIcon,
  BeakerIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon
};

interface StemPartnerProps {
  config: StemPartnerPageConfig;
}

export default function StemPartner({ config }: StemPartnerProps) {
  const { hero, collaborators, initiative, programs, featured_resources, support, timeline, grant_callout, target_audience, contact } = config;

  const [scrolled, setScrolled] = useState(false);
  const isSnapping = useRef(false);
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



  const scrollToContent = () => {
    if (contentRef.current) {
      performSmoothScroll(contentRef.current.getBoundingClientRect().top + window.scrollY);
    }
  };

  // NOTE: This array is currently not being used in favor of the global theme colors. It is kept here for future reference.
  /*
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
  */

  const renderHeadline = (text: string) => {
    if (text === 'Riverside STEM Partner Program') {
      return (
        <>
          <span className="text-neutral-900 dark:text-white">Riverside </span>
          <span className="text-neutral-900 dark:text-white">STEM </span>
          <span className="text-neutral-900 dark:text-white">Partner </span>
          <span className="text-neutral-900 dark:text-white block">Program</span>
        </>
      );
    }
    return text;
  };

  return (
    <div className="w-full">
      {/* Preload hero logos to prevent re-fetching when AnimatePresence unmounts them on scroll */}
      {collaborators && (
        <div className="hidden" aria-hidden="true">
          {collaborators.items.map((collab, idx) => (
            collab.logo_url !== 'placeholder' && (
              <img key={`preload-logo-${idx}`} src={collab.logo_url} alt="" />
            )
          ))}
        </div>
      )}

      {/* 1. Hero */}
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
              className="relative z-20 w-11/12 max-w-7xl mx-auto rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-3xl backdrop-saturate-200"
            >
              {/* 1. The Synced Glowing Hue (Blurred and positioned behind) */}
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-50 dark:opacity-40 -z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,var(--accent),var(--primary),var(--accent))]" />
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
                <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,var(--accent),var(--primary),var(--accent))] opacity-100" />
              </div>

              {/* 3. Inner Content Wrapper */}
              <div className="relative z-10 w-full h-full text-center px-6 md:px-12 py-10 rounded-2xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg mb-4 text-neutral-900 dark:text-white">
                  {renderHeadline(hero.headline)}
                </h1>

                {/* Collaborators */}
                {collaborators && (
                  <div className="mt-8 md:mt-12 flex flex-col items-center">
                    {collaborators.title && (
                      <h2 className="text-xs md:text-sm font-bold tracking-widest text-neutral-600 dark:text-neutral-300 uppercase mb-6">
                        {collaborators.title}
                      </h2>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                      {collaborators.items.map((collab, idx) => (
                        <div key={idx} className="relative flex items-center justify-center">
                          {collab.logo_url === 'placeholder' ? (
                            <div className="w-40 h-16 md:w-48 md:h-20 bg-neutral-200/50 dark:bg-neutral-800/50 backdrop-blur-md rounded-xl flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-300 border border-neutral-300/30 dark:border-white/10 opacity-80 shadow-sm">
                              <svg className="w-5 h-5 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-semibold text-[10px] md:text-xs uppercase tracking-wider text-center px-2">{collab.name}</span>
                            </div>
                          ) : collab.link ? (
                            <Link href={collab.link} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={collab.logo_url}
                                alt={`${collab.name} logo`}
                                className="max-h-16 md:max-h-20 w-auto object-contain rounded-xl shadow-md border border-neutral-200/50 dark:border-white/10"
                              />
                            </Link>
                          ) : (
                            <img
                              src={collab.logo_url}
                              alt={`${collab.name} logo`}
                              className="max-h-16 md:max-h-20 w-auto object-contain rounded-xl shadow-md border border-neutral-200/50 dark:border-white/10"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

        {/* 2. Initiative */}
        <section className="pt-0 pb-8 md:pb-16 flex flex-col items-center space-y-12">
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
              <p
                key={idx}
                className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(p) }}
              />
            ))}
          </motion.div>

          {/* Target Audience */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr"
          >
            {target_audience.items.map((item, idx) => {
              const Icon = iconMap[item.icon] || UserGroupIcon;
              return (
                <div key={idx} className="h-full bg-white dark:bg-neutral-800/50 p-8 rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
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

        {/* 3. Timeline */}
        {timeline && (
          <section className="py-8 md:py-16 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full text-center px-4"
            >
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">{timeline.headline}</h2>
              <h3 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tighter">{timeline.sub_headline}</h3>
            </motion.div>

            <div className="relative max-w-4xl mx-auto px-4" ref={timelineRef}>
              {/* Background Gray Line */}
              <div className="absolute left-[2.25rem] -translate-x-px md:left-1/2 md:-translate-x-1/2 top-0 h-full w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

              {/* Animated Tracking Blue Line */}
              <motion.div
                className="absolute left-[2.25rem] -translate-x-px md:left-1/2 md:-translate-x-1/2 top-0 w-0.5 bg-accent z-0 origin-top"
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
                          className="absolute inset-0 rounded-full border-4 border-white dark:border-black bg-accent flex items-center justify-center text-white text-xs font-black"
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
                        <span className="font-bold text-accent text-sm tracking-wide uppercase">Level {level.level}</span>
                        <h4 className="text-xl font-bold text-primary mt-2 mb-2">{level.title}</h4>
                        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{level.text}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Programs */}
        <section className="py-8 md:py-16 space-y-12">
          {programs && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full text-center px-4"
            >
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">{programs.title}</h2>
              <h3 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tighter">{programs.headline}</h3>
            </motion.div>
          )}

          {/* Featured Resources */}
          {featured_resources && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full auto-rows-fr"
            >
              {featured_resources.items.map((resource, idx) => {
                const isExternal = resource.link.startsWith('http');
                return (
                  <Link
                    href={resource.link}
                    key={idx}
                    className="block group h-full"
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <div className="h-full bg-white dark:bg-neutral-800/50 p-8 rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center group-hover:shadow-xl group-hover:border-accent dark:group-hover:border-accent group-hover:ring-2 group-hover:ring-accent dark:group-hover:ring-accent transition-all duration-300 relative overflow-hidden">

                      <h4 className="text-2xl md:text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-4 tracking-tighter leading-tight group-hover:text-accent transition-colors duration-300">
                        {resource.name}
                      </h4>

                      <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {resource.description}
                      </p>

                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}

          {/* Programs (Marquee Rows) */}
          {programs && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 w-full overflow-hidden relative group pb-8 select-none cursor-default"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)'
              }}
            >
              {(() => {
                const allFeatures = programs.items.flatMap(item => item.features || []);
                const createSet = () => [...Array(2)].map((_, i) => (
                  <React.Fragment key={i}>
                    {allFeatures.map((feature, fIdx) => (
                      <span
                        key={`${i}-${fIdx}`}
                        className="whitespace-nowrap inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </React.Fragment>
                ));

                return (
                  <motion.div
                    className="flex w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 180, repeat: Infinity }}
                  >
                    {/* First Set */}
                    <div className="flex gap-2 md:gap-2.5 pr-2 md:pr-2.5">
                      {createSet()}
                    </div>
                    {/* Second Set (Duplicated for Marquee) */}
                    <div className="flex gap-2 md:gap-2.5 pr-2 md:pr-2.5">
                      {createSet()}
                    </div>
                  </motion.div>
                );
              })()}
            </motion.div>
          )}
        </section>

        {/* 5. Support & Grant Callout */}
        {(support || grant_callout) && (
          <section className="py-8 md:py-16 max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch auto-rows-fr">
              {/* Left Pane: Support */}
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
                        <CheckCircleIcon className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-300 text-base md:text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Right Pane: Grant Callout */}
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

        {/* 6. Contact */}
        <section id="contact" className="pt-8 md:pt-16 pb-0">
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
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[linear-gradient(to_right,var(--primary),var(--accent))] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {contact.headline}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-neutral-300 leading-relaxed font-medium">
                {contact.body}
              </p>

              <div className="flex justify-center space-x-2 my-8">
                <div className="w-10 h-1 bg-primary rounded-full opacity-50"></div>
                <div className="w-10 h-1 bg-primary rounded-full opacity-50"></div>
                <div className="w-10 h-1 bg-primary rounded-full opacity-50"></div>
              </div>

              <div className="pt-4 text-xl md:text-2xl font-medium tracking-wide">
                Contact <span className="font-bold text-primary">{contact.info.name}</span> at <br className="md:hidden" />
                <span className="font-bold text-primary">
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
