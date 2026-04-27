import { getConfig } from '@/lib/config';
import { getPageConfig } from '@/lib/content';
import type { HomeContent } from '@/types/home';
import Hero from '@/components/home/Hero';

export default function Home() {
  // 1. Pull in the global site configuration
  const config = getConfig();

  // 2. Fetch the homepage specific data from the file system using the generic fetcher
  const homeContent = getPageConfig<HomeContent>('home');
  
  // Provide a fallback array to prevent mapping errors if the TOML file is empty or malformed
  const initiatives = homeContent?.initiatives || [];

  return (
    <>
      {/* 3. Pass the fetched data down to the Client Component */}
      <Hero initiatives={initiatives} />
    </>
  );
}
