# Setup

## File Structure

```text
rsf-website/
├── content/
│   └── config.toml
├── public/
│   └── (Your specific images/logos - Scratch)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── home/
│   │   │   └── Hero.tsx
│   │   ├── layout/
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       ├── ThemeProvider.tsx
│   │       └── ThemeToggle.tsx
│   └── lib/
│       ├── stores/
│       │   └── themeStore.ts
│       ├── config.ts
│       └── utils.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Modified Files

- `content/config.toml`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/layout/Navigation.tsx`
- `src/components/layout/Footer.tsx`
- `src/lib/config.ts`

## Copied Files

- `src/components/ui/ThemeProvider.tsx`
- `src/components/ui/ThemeToggle.tsx`
- `src/lib/stores/themeStore.ts`
- `src/lib/utils.ts`

## Setup Commands

1. `npx create-next-app@latest rsf-website`
2. `npm install framer-motion zustand @headlessui/react @heroicons/react lucide-react smol-toml clsx next-themes`
3. `npm run dev`
