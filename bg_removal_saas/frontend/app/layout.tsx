import type { Metadata } from 'next';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { Navbar } from '@/components/sections/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'VCrancks AI — Professional Background Removal',
  description: 'Remove backgrounds from any image with AI. Custom neural network delivering pixel-perfect results at machine speed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased bg-[#0C0806]">
        <SmoothScrollProvider>
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
