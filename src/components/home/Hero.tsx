'use client';

import { motion } from 'framer-motion';

// --- PLACEHOLDER DATA ---

const threeCardsData = [
  {
    title: "STEM Education",
    content: "Providing cutting-edge resources and curriculum to schools across the Inland Empire.",
    image: "https://images.unsplash.com/photo-scale-placeholder-1" // Placeholder
  },
  {
    title: "Community Outreach",
    content: "Engaging parents, educators, and leaders to foster a culture of scientific curiosity.",
    image: "https://images.unsplash.com/photo-scale-placeholder-2" // Placeholder
  },
  {
    title: "Scholarship Programs",
    content: "Supporting the next generation of scientists and engineers with direct financial aid.",
    image: "https://images.unsplash.com/photo-scale-placeholder-3" // Placeholder
  }
];

const sixCardsData = [
  { title: "Our Mission", content: "To bridge the educational gap and ensure equitable access to STEM resources for all students." },
  { title: "2016 Founding", content: "Established by a coalition of passionate educators, scientists, and philanthropists." },
  { title: "Teacher Grants", content: "We provide direct funding to educators looking to bring innovative projects to their classrooms." },
  { title: "Science Fairs", content: "Sponsoring and organizing regional competitions to showcase student talent and hard work." },
  { title: "Mentorship", content: "Connecting high school students with industry professionals in the Riverside tech corridor." },
  { title: "Future Goals", content: "Expanding our reach to serve over 50,000 students annually by the end of the decade." }
];

// --- COMPONENT ---

export default function Hero() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12 pt-12">
      
      {/* 1. HERO SECTION (Picture with Blur Effect) */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[60vh] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
      >
        {/* Background Image Placeholder (Uses a random abstract image for now) */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop")' }}
        />
        {/* Dark overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Blurred Glass Box with Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-20 text-center px-8 py-10 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-glass"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
            Riverside STEM Foundation
          </h1>
        </motion.div>
      </motion.section>

      {/* 2. ROW OF 3 CARDS */}
      {/* <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-primary mb-8"
      >
        Our Initiatives
      </motion.h2> */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {threeCardsData.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col"
            >
              {/* Card Image Area */}
              <div className="h-48 bg-neutral-200 dark:bg-neutral-800 relative">
                {/* We use a colored placeholder div here, but you will replace this with an <img> tag later */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-neutral-500">
                  [Image Placeholder]
                </div>
              </div>
              {/* Card Content Area */}
              <div className="p-4 flex-grow">
                <h3 className="text-xl font-semibold text-primary mb-3">{card.title}</h3>
                <p className="text-base text-neutral-600 dark:text-neutral-500 leading-relaxed">
                  {card.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. ROW OF 6 STACKED CARDS */}
      <section>
        <div className="grid gap-4">
          {sixCardsData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <h3 className="font-semibold text-xl mb-2 leading-tight">
                {item.title}
              </h3>
              <p className="text-base text-neutral-600 dark:text-neutral-500">
                {item.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
