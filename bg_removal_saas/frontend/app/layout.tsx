import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'PixelForge | Professional AI Background Removal',
  description: 'AI-powered, 40ms per image background removal. Ultra-high fidelity.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent/30',
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          {/* Universal Background Effects */}
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none -z-10" />
          
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
