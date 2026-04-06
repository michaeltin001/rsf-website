import { getConfig } from '@/lib/config';
import Hero from '@/components/home/Hero';

export default function Home() {
  // Pull in the global site configuration
  const config = getConfig();

  return (
    <>
      <Hero />
    </>
  );
}
