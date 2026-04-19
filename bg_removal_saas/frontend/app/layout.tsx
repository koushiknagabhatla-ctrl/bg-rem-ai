import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BG Remover AI",
  description: "AI-powered, 40ms per image background removal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen font-sans bg-background text-white selection:bg-accent/30">
        <main className="container mx-auto px-4 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
