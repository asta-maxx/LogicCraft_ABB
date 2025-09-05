import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ABB IEC 61131 Code Generator - Professional Edition',
  description: 'Advanced AI-powered code generator for IEC 61131-3 Structured Text. Professional industrial automation development tool by ABB.',
  keywords: 'IEC 61131, Structured Text, PLC, ABB, Industrial Automation, Code Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
