"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavHeader({ session, handleSignOut }: { session: any, handleSignOut: () => void }) {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      className="relative mx-auto flex w-fit rounded-full glass3d p-1 border border-[#8B5E3C]/20"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      <Tab setPosition={setPosition} href="/">Home</Tab>
      <Tab setPosition={setPosition} href="/about">About</Tab>
      <Tab setPosition={setPosition} href={session ? '/tool' : '/login'}>Workspace</Tab>

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({ children, setPosition, href }: { children: React.ReactNode; setPosition: any; href: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      ref={ref}
      href={href}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={`relative z-10 block px-4 py-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase transition-colors duration-300 md:px-6 md:py-2.5 ${isActive ? 'text-white' : 'text-[#BFA899] hover:text-white'}`}
    >
      {children}
    </Link>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute z-0 h-[80%] my-auto top-0 bottom-0 rounded-full border border-[#C4956A]/20 bg-[#C4956A]/20 pointer-events-none"
    />
  );
};
