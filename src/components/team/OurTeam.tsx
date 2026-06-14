'use client';

import { motion } from 'framer-motion';
import type { OurTeamPageConfig } from '@/types/page';

interface OurTeamProps {
  config: OurTeamPageConfig;
}

export default function OurTeam({ config }: OurTeamProps) {
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

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-8 md:gap-10">
        {config.team?.map((member, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-full flex flex-col items-center p-6 bg-white/10 dark:bg-black/10 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 shadow-xl rounded-3xl group overflow-hidden transition-all hover:shadow-2xl"
          >
            {/* Image Placeholder */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-6 overflow-hidden border-4 border-neutral-100 dark:border-neutral-900 shadow-inner group-hover:scale-105 transition-transform duration-500 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Initials Placeholder */}
              <span className="text-4xl font-extrabold text-neutral-400 dark:text-neutral-600 group-hover:text-accent transition-colors duration-500 uppercase tracking-widest">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Member Info */}
            <h3 className="text-2xl font-bold text-primary mb-1 text-center">
              {member.name}
            </h3>

            <p className="text-sm font-semibold tracking-widest text-accent uppercase mb-4 text-center">
              {member.title}
            </p>

            <p className="text-neutral-600 dark:text-neutral-300 text-center text-sm leading-relaxed">
              {member.description}
            </p>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
