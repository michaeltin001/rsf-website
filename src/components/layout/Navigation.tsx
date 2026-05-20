'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SiteConfig } from '@/lib/config';

interface NavigationProps {
  items?: SiteConfig['navigation'];
}

export default function Navigation({ items }: NavigationProps) {
  // const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState(''); // Tracks the section currently in view
  const isClickNavigating = useRef(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, []);

  const { scrollY } = useScroll();
  const navBackgroundOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const navY = useTransform(scrollY, [0, 50], [-100, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      if (isClickNavigating.current) return;

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      
      if (isAtBottom && items && items.length > 0) {
        const lastItem = items[items.length - 1];
        if (lastItem.target) {
          setActiveHash(`#${lastItem.target}`);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Set up the Intersection Observer for "Scroll Spy" functionality
  useEffect(() => {
    // Set initial hash on client load
    if (typeof window !== 'undefined') {
      setActiveHash(window.location.hash);
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isClickNavigating.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHash(`#${entry.target.id}`);
        }
      });
    };

    const observerOptions = {
      root: null,
      // Creates a tight 2% detection band in the exact center of the screen
      rootMargin: '-49% 0px -49% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Grab the targets dynamically based on your config.toml
    items?.forEach(item => {
      if (item.target) {
        const element = document.getElementById(item.target);
        if (element) observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  // Quality of Life: Cleanse URL hash on page refresh
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      // Replaces the URL with just the pathname (e.g., '/', stripping the hash)
      window.history.replaceState(null, '', window.location.pathname);
      
      // Optional: If you also want to force the user back to the very top of the page on refresh, uncomment the line below:
      // window.scrollTo(0, 0); 
    }
  }, []);

  const handleLogoClick = () => {
    // 1. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 2. Cleanse the URL in the browser address bar
    window.history.replaceState(null, '', window.location.pathname);
    
    // 3. Clear the active tab highlight
    setActiveHash('');

    isClickNavigating.current = true;
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => {
      isClickNavigating.current = false;
    }, 1000);
  };

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {({ open }) => (
        <>
          <motion.div
            style={{ y: scrolled ? 0 : navY }}
            className="transition-all duration-300 ease-out pointer-events-auto relative"
          >
            <motion.div 
              style={{ opacity: navBackgroundOpacity }}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 shadow-sm"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex justify-between items-center h-14 lg:h-16">
                <div className="flex-shrink-0 flex items-center">
                  <button 
                    onClick={handleLogoClick}
                    className="focus:outline-none cursor-pointer"
                    aria-label="Scroll to top"
                  >
                    <AnimatePresence mode="wait">
                      {scrolled && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center text-primary hover:text-accent transition-colors"
                        >
                          <span className="hidden md:block text-xl font-bold tracking-tight">
                            Riverside STEM Foundation
                          </span>
                          <BeakerIcon className="h-6 w-6 md:hidden" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                <div className="hidden lg:block">
                  <div className="ml-10 flex items-center space-x-8">
                    <div className="flex items-baseline space-x-8">
                      {items?.map((item) => {
                        // const isActive = item.href === '/' 
                        //   ? pathname === '/' 
                        //   : pathname.startsWith(item.href);

                        // Check if the current hash matches the target from config.toml
                        const isActive = activeHash === `#${item.target}`;

                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            prefetch={true}
                            onClick={() => {
                              setActiveHash(`#${item.target}`);
                              isClickNavigating.current = true;
                              if (clickTimeout.current) clearTimeout(clickTimeout.current);
                              clickTimeout.current = setTimeout(() => {
                                isClickNavigating.current = false;
                              }, 1000);
                            }}
                            className={cn(
                              'relative px-3 py-2 text-base font-medium transition-all duration-200 rounded hover:bg-accent/20 hover:shadow-sm',
                              isActive
                                ? 'text-primary dark:text-primary-light'
                                : 'text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light'
                            )}
                          >
                            <span className="relative z-10">{item.title}</span>
                            {isActive && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-accent/20 rounded-lg"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="lg:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent transition-colors duration-200 cursor-pointer">
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
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {open && scrolled && (
              <Disclosure.Panel static className="pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {items?.map((item, index) => {
                      // const isActive = item.href === '/' 
                      //   ? pathname === '/' 
                      //   : pathname.startsWith(item.href);

                      const isActive = activeHash === `#${item.target}`;

                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Disclosure.Button
                            as={Link}
                            href={item.href}
                            prefetch={true}
                            onClick={() => {
                              setActiveHash(`#${item.target}`);
                              isClickNavigating.current = true;
                              if (clickTimeout.current) clearTimeout(clickTimeout.current);
                              clickTimeout.current = setTimeout(() => {
                                isClickNavigating.current = false;
                              }, 1000);
                            }}
                            className={cn(
                              'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                              isActive
                                ? 'text-primary dark:text-primary-light bg-accent/20 border-l-4 border-accent'
                                : 'text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light hover:bg-accent/20'
                            )}
                          >
                            {item.title}
                          </Disclosure.Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
