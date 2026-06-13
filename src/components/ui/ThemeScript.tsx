'use client';

import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme-storage');
              const parsed = theme ? JSON.parse(theme) : null;
              const setting = parsed?.state?.theme || 'system';
              const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const effective = setting === 'dark' ? 'dark' : (setting === 'light' ? 'light' : (prefersDark ? 'dark' : 'light'));
              var root = document.documentElement;
              root.classList.add(effective);
              root.setAttribute('data-theme', effective);
            } catch (e) {
              var root = document.documentElement;
              root.classList.add('light');
              root.setAttribute('data-theme', 'light');
            }
          `,
        }}
      />
    );
  });

  return null;
}
