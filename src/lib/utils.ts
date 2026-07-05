import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

export function formatYear(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric'
  }).format(new Date(date));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseMarkdown(text: string): string {
  if (!text) return '';
  let parsed = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent font-semibold">$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
      const target = p2.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${p2}"${target} class="text-accent hover:underline font-semibold">${p1}</a>`;
    })
    .replace(/^[ \t]*[-*+][ \t]+(.*)$/gm, '<li>$1</li>');

  parsed = parsed.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/g, '<ul class="list-disc pl-5 my-2 space-y-1">$1</ul>');
  return parsed;
}

export function parseMarkdownWithColor(text: string, colorClass: string): string {
  if (!text) return '';
  let parsed = text
    .replace(/\*\*(.*?)\*\*/g, `<strong class="${colorClass} font-semibold">$1</strong>`)
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
      const target = p2.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${p2}"${target} class="${colorClass} hover:underline font-semibold">${p1}</a>`;
    })
    .replace(/^[ \t]*[-*+][ \t]+(.*)$/gm, '<li>$1</li>');

  parsed = parsed.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/g, '<ul class="list-disc pl-5 my-2 space-y-1">$1</ul>');
  return parsed;
}
