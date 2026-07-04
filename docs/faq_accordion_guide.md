# Animated FAQ Accordion Guide

This guide explains how to build a dynamic, animated FAQ accordion using **React**, **Tailwind CSS**, and **Framer Motion**, powered by a **TOML** content file. This architecture allows content editors to easily update the FAQ without touching the code.

## 1. Data Structure (`types.ts`)

First, define the TypeScript interfaces that structure your FAQ data. This ensures type safety when passing data from your configuration file into your components.

```typescript
// types.ts
export interface FaqItem {
    question: string;
    answer: string;
}

export interface FaqSection {
    headline: string;
    sub_headline: string;
    items: FaqItem[];
}
```

## 2. Content Source (`data.toml`)

By extracting the FAQ content into a TOML file, you decouple your site's content from its logic. This makes it incredibly easy to update questions and answers.

```toml
# data.toml
[faq]
headline = "Frequently Asked Questions"
sub_headline = "Everything you need to know."

[[faq.items]]
question = "How do I implement this accordion?"
answer = "By following this guide! You define the data in TOML, parse it, and render it using Framer Motion for smooth animations."

[[faq.items]]
question = "Can I customize the colors?"
answer = "Yes, simply swap out the Tailwind CSS classes in the component code below with your preferred brand colors."
```

## 3. The Accordion Component (`FaqAccordion.tsx`)

This is the interactive client component. It tracks which FAQ item is currently open using React state (`useState`), and it uses `framer-motion`'s `<AnimatePresence>` to gracefully animate the height of the answer when toggled.

> [!TIP]
> Ensure you include `'use client';` at the top of the file since this component relies on interactivity and hooks (`useState`).

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // Or your preferred icon library
import type { FaqSection } from './types';

interface FaqAccordionProps {
  faqData: FaqSection;
}

export default function FaqAccordion({ faqData }: FaqAccordionProps) {
  // State to track which accordion item is open. null means all are closed.
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="py-8 md:py-16 max-w-7xl mx-auto px-4 space-y-12">

      {/* Accordion List */}
      <div className="space-y-4">
        {faqData.items.map((item, idx) => {
          const isOpen = openFaqIndex === idx;

          return (
            <motion.div
              key={idx}
              // Entrance animation for the cards loading onto the page
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Question / Toggle Button */}
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
              >
                <span className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white pr-4">
                  {item.question}
                </span>
                
                {/* Animated Chevron Icon */}
                <div 
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${
                    isOpen 
                      ? 'bg-primary-500 text-white rotate-180' 
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </button>

              {/* Expandable Answer Area */}
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
  );
}
```

## 4. Data Flow

Here is how the data moves through the application:

1. **Storage**: The raw FAQ content is authored and stored in `data.toml`.
2. **Parsing (Server-side)**: A server component (like a Next.js `page.tsx`) reads the TOML file from the file system and parses it into a JavaScript object that matches the `FaqSection` TypeScript interface.
3. **Props Passing**: The server component passes the parsed `faqData` object as a prop to the `FaqAccordion` client component.
4. **Rendering (Client-side)**: `FaqAccordion` receives the data, iterates over the `items` array, and renders the interactive UI using Framer Motion. When a user clicks a question, React updates the local `openFaqIndex` state, and Framer Motion handles the height transition.
