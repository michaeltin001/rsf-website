import { getPageConfig } from '@/lib/content';
import type { HomePageConfig } from '@/types/page';
import Hero from '@/components/home/Hero';

export default function Home() {
  // 2. Fetch the homepage specific data from the file system using the generic fetcher
  const homeContent = getPageConfig<HomePageConfig>('home');
  
  // Provide a fallback array to prevent mapping errors if the TOML file is empty or malformed
  const initiatives = homeContent?.initiatives || [];
  const hero = homeContent?.hero || { title: 'Riverside STEM Foundation', backgroundImage: '' };
  const about = homeContent?.about || { title: 'About Us', headline: 'Est. 2016', content: '', imagePlaceholder: '' };
  const impact = homeContent?.impact || { title: 'Our Impact', headlinePrefix: '$300k', headlineHighlight: '+', content: '', metrics: [] };
  const volunteer = homeContent?.volunteer || { title: 'Volunteer', headline: 'Join Us', content: '', buttonPrimary: '', buttonSecondary: '', imagePlaceholder: '' };

  return (
    <>
      {/* 3. Pass the fetched data down to the Client Component */}
      <Hero 
        hero={hero}
        about={about}
        impact={impact}
        initiatives={initiatives}
        volunteer={volunteer}
      />
    </>
  );
}
