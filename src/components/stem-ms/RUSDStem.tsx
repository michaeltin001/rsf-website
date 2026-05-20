'use client';

import type { RUSDStemPageConfig } from '@/types/page';

interface RusdStemProps {
  config: RUSDStemPageConfig;
}

export default function RUSDStem({ config }: RusdStemProps) {
  const { header, program_details } = config;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Basic Text Header (No Hero Image Background) */}
      <section className="py-8 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {header.headline}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          {header.description}
        </p>
      </section>

      {/* Program Details Section */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">{program_details.title}</h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          {program_details.content}
        </p>
      </section>
    </div>
  );
}
