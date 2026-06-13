import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="w-full max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center space-y-6">
        <h1 className="text-8xl md:text-9xl font-extrabold text-primary tracking-tighter drop-shadow-sm">
          404
        </h1>
        
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200">
            Page Not Found
          </h2>
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
