'use client';

import { NextUIProvider } from '@nextui-org/react';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <SessionProvider>{children}</SessionProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#17C964',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#F31260',
              color: '#fff',
            },
          },
        }}
      />
    </NextUIProvider>
  );
}