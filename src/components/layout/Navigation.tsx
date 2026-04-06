'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="focus:outline-none"
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
                        const isActive = item.href === '/' 
                          ? pathname === '/' 
                          : pathname.startsWith(item.href);

                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                              'relative px-3 py-2 text-base font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm',
                              isActive
                                ? 'text-primary'
                                : 'text-neutral-600 hover:text-primary'
                            )}
                          >
                            <span className="relative z-10">{item.title}</span>
                            {isActive && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-accent/10 rounded-lg"
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
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent transition-colors duration-200">
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
                          <Disclosure.Button
                            as={Link}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                              'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                              isActive
                                ? 'text-primary bg-accent/10 border-l-4 border-accent'
                                : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
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
