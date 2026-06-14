'use client';

import { motion } from 'framer-motion';
import type { TallyPageConfig } from '@/types/page';

interface TallyProps {
  config: TallyPageConfig;
}

export default function Tally({ config }: TallyProps) {
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

        {config.description && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto"
          >
            {config.description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
