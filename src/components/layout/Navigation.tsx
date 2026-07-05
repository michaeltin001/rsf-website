'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SiteConfig } from '@/lib/config';

interface NavigationProps {
  items?: SiteConfig['navigation'];
  transparentNavPaths?: string[];
}

export default function Navigation({ items, transparentNavPaths = [] }: NavigationProps) {
  const pathname = usePathname();
  const isTransparentNav = transparentNavPaths.includes(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const closeDisclosureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const activeIndex = items?.findIndex(item => item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));
      if (activeIndex !== undefined && activeIndex >= 0 && navRefs.current[activeIndex]) {
        const el = navRefs.current[activeIndex];
        if (el) {
          setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth,
            opacity: 1
          });
        }
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Delay calculation to ensure DOM is fully painted
    const timeoutId = setTimeout(handleResize, 50);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname, items]);

  const { scrollY } = useScroll();
  const navBackgroundOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const navY = useTransform(scrollY, [0, 50], [-100, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bug: Mobile hamburger menu stays open when nav auto-hides
  //
  // Root cause: On transparent-nav pages (e.g., home, StemPartner), scrolling
  // back to the hero triggers a smooth scroll to scrollY = 0, which auto-hides
  // the nav bar via the navY transform. However, the DisclosurePanel sits
  // outside that transform div and is controlled by Headless UI's internal
  // state — so it remained visible even after the nav bar slid away.
  //
  // Why it was tricky: Simply calling close() to dismiss the Disclosure
  // triggered a React re-render mid-scroll, which interrupted the Hero's
  // smooth scroll animation — the page would stop short of scrollY = 0,
  // leaving the nav bar visible until an additional scroll.
  //
  // The fix:
  // - Two-phase panel dismissal
  // - Added closeDisclosureRef to capture Headless UI's close function from
  //   the Disclosure render prop
  // - Phase 1 (CSS): Applied opacity-0 pointer-events-none to the
  //   DisclosurePanel when isTransparentNav && !scrolled — instant visual
  //   hide with zero scroll interference
  // - Phase 2 (deferred close): A scrollY motion value listener calls close()
  //   only when scrollY < 5, ensuring the smooth scroll has already finished
  //   before any React state change occurs
  // - Also calls document.activeElement.blur() to clear the persistent focus
  //   ring on the hamburger button
  useEffect(() => {
    if (!isTransparentNav) return;

    const unsubscribe = scrollY.on('change', (latest) => {
      if (latest < 5) {
        closeDisclosureRef.current?.();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    });
    return unsubscribe;
  }, [isTransparentNav, scrollY]);

  // Ensure we scroll to the top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') {
      return;
    }

    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Disclosure as="nav" className="fixed top-4 left-0 right-0 z-50 pointer-events-none px-4 sm:px-6 lg:px-8">
      {({ open, close }) => {
        closeDisclosureRef.current = close;
        return (
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            layoutRoot
            style={{ y: isTransparentNav ? (scrolled ? 0 : navY) : 0 }}
            className="transition-all duration-300 ease-out pointer-events-auto relative"
          >
            <motion.div 
              style={{ opacity: isTransparentNav ? navBackgroundOpacity : 1 }}
              className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-3xl backdrop-saturate-200 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
            />

            <div className="relative z-10 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 lg:h-16">
                <div className="flex-shrink-0 flex items-center">
                  <Link
                    href="/"
                    onClick={handleLogoClick}
                    className="focus:outline-none cursor-pointer"
                    aria-label="Home"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center text-primary hover:text-accent transition-colors"
                    >
                      <span className="hidden md:block text-xl font-bold tracking-tight">
                        Riverside STEM Foundation
                      </span>
                      <HomeIcon className="h-6 w-6 md:hidden" />
                    </motion.div>
                  </Link>
                </div>

                <div className="hidden lg:block">
                  <div className="ml-10 flex items-center space-x-8">
                    <div className="relative flex items-baseline space-x-8">
                      <motion.div
                        className="absolute inset-y-0 bg-accent/20 rounded-lg pointer-events-none"
                        initial={false}
                        animate={{
                          left: indicatorStyle.left,
                          width: indicatorStyle.width,
                          opacity: indicatorStyle.opacity
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                      {items?.map((item, index) => {
                        const isActive = item.href === '/' 
                          ? pathname === '/' 
                          : pathname.startsWith(item.href);

                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            ref={(el) => {
                              navRefs.current[index] = el;
                            }}
                            prefetch={true}
                            className={cn(
                              'relative px-3 py-2 text-base font-medium transition-all duration-200 rounded hover:bg-accent/20 hover:shadow-sm',
                              isActive
                                ? 'text-primary dark:text-primary-light'
                                : 'text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light'
                            )}
                          >
                            <span className="relative z-10">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="lg:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  <DisclosureButton className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none transition-colors duration-200 cursor-pointer">
                    <span className="sr-only">Open main menu</span>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </motion.div>
                  </DisclosureButton>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {open && (
              <DisclosurePanel
                static
                className={cn(
                  'mt-2 transition-opacity duration-200',
                  isTransparentNav && !scrolled
                    ? 'opacity-0 pointer-events-none'
                    : 'pointer-events-auto'
                )}
              >
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden bg-white/10 dark:bg-black/10 backdrop-blur-3xl backdrop-saturate-200 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {items?.map((item, index) => {
                      const isActive = item.href === '/' 
                        ? pathname === '/' 
                        : pathname.startsWith(item.href);

                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <DisclosureButton
                            as={Link}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                              'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                              isActive
                                ? 'text-primary dark:text-primary-light bg-accent/20 border-l-4 border-accent'
                                : 'text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light hover:bg-accent/20'
                            )}
                          >
                            {item.title}
                          </DisclosureButton>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </DisclosurePanel>
            )}
          </AnimatePresence>
        </div>
      );
      }}
    </Disclosure>
  );
}
