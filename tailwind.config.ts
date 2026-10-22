import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { obsidian: '#030303', crimson: '#c40024' }, fontFamily: { mono: ['JetBrains Mono', 'monospace'] } } },
  plugins: [],
} satisfies Config;
