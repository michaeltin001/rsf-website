'use client';

import { motion } from 'framer-motion';
import type { SciolyResourcesPageConfig } from '@/types/page';

interface SciolyResourcesProps {
  config: SciolyResourcesPageConfig;
}

export default function SciolyResources({ config }: SciolyResourcesProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-12">

      {/* Header Section */}
      <div className="text-center mb-16 md:mb-24 space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary tracking-tight"
        >
          {config.title}
        </motion.h1>

        {config.paragraphs && (
          <div className="mt-8 space-y-4">
            {config.paragraphs.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
