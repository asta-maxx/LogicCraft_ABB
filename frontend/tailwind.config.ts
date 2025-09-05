import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              50: '#e6f1fe',
              100: '#cce3fd',
              200: '#99c7fb',
              300: '#66aaf9',
              400: '#338ef7',
              500: '#006FEE',
              600: '#005bc4',
              700: '#004799',
              800: '#00336f',
              900: '#001f44',
              DEFAULT: '#006FEE',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#f2e8fc',
              100: '#e4d0f9',
              200: '#c9a1f3',
              300: '#ae72ed',
              400: '#9353d3',
              500: '#7828C8',
              600: '#6020a0',
              700: '#481878',
              800: '#301050',
              900: '#180828',
              DEFAULT: '#7828C8',
              foreground: '#ffffff',
            },
            success: {
              50: '#e8fdf2',
              100: '#d1fae5',
              200: '#a3f3cb',
              300: '#75ecb1',
              400: '#47e597',
              500: '#17C964',
              600: '#12a150',
              700: '#0e793c',
              800: '#095028',
              900: '#052814',
              DEFAULT: '#17C964',
              foreground: '#ffffff',
            },
            danger: {
              50: '#fef2f2',
              100: '#fee2e2',
              200: '#fecaca',
              300: '#fca5a5',
              400: '#f87171',
              500: '#F31260',
              600: '#dc2626',
              700: '#b91c1c',
              800: '#991b1b',
              900: '#7f1d1d',
              DEFAULT: '#F31260',
              foreground: '#ffffff',
            },
          },
        },
        light: {
          colors: {
            primary: {
              50: '#e6f1fe',
              100: '#cce3fd',
              200: '#99c7fb',
              300: '#66aaf9',
              400: '#338ef7',
              500: '#006FEE',
              600: '#005bc4',
              700: '#004799',
              800: '#00336f',
              900: '#001f44',
              DEFAULT: '#006FEE',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#f2e8fc',
              100: '#e4d0f9',
              200: '#c9a1f3',
              300: '#ae72ed',
              400: '#9353d3',
              500: '#7828C8',
              600: '#6020a0',
              700: '#481878',
              800: '#301050',
              900: '#180828',
              DEFAULT: '#7828C8',
              foreground: '#ffffff',
            },
            success: {
              50: '#e8fdf2',
              100: '#d1fae5',
              200: '#a3f3cb',
              300: '#75ecb1',
              400: '#47e597',
              500: '#17C964',
              600: '#12a150',
              700: '#0e793c',
              800: '#095028',
              900: '#052814',
              DEFAULT: '#17C964',
              foreground: '#ffffff',
            },
            danger: {
              50: '#fef2f2',
              100: '#fee2e2',
              200: '#fecaca',
              300: '#fca5a5',
              400: '#f87171',
              500: '#F31260',
              600: '#dc2626',
              700: '#b91c1c',
              800: '#991b1b',
              900: '#7f1d1d',
              DEFAULT: '#F31260',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
};
export default config;