import type { Metadata } from 'next';
import { Navbar } from '@/components/sections/Navbar';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { Cursor } from '@/components/ui/Cursor';
import './globals.css';

export const metadata: Metadata = {
  title: 'VCranks AI — Professional Background Removal',
  description: 'Remove backgrounds from any image with AI. Custom neural network delivering pixel-perfect results at machine speed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <SmoothScrollProvider>
          <Cursor />
          <Navbar />
          <main>{children}</main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
