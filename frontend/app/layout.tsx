import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BG Remover AI — Remove Backgrounds Instantly",
  description:
    "Remove image backgrounds in seconds with our custom-trained MobileNetV3 neural network. 50 free credits on signup. No watermarks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0f] font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
