"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from 'next/navigation';

type NavItem = { label: string; href: string; scrollTo?: string };

export function NavHeader({ session, handleSignOut }: { session: any, handleSignOut: () => void }) {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    { label: 'Home', href: '/', scrollTo: 'hero' },
    { label: 'About', href: '/', scrollTo: 'about' },
    { label: 'Workspace', href: session ? '/tool' : '/login', scrollTo: session ? 'tool-section' : undefined },
  ];

  const handleNav = (item: NavItem) => {
    if (item.scrollTo && pathname === '/') {
      const el = document.getElementById(item.scrollTo);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    if (item.scrollTo && pathname !== '/') {
      router.push('/#' + item.scrollTo);
      return;
    }
    router.push(item.href);
  };

  return (
    <ul
      className="relative mx-auto flex w-fit rounded-full bg-[#1A0E08]/60 backdrop-blur-md p-1 border border-[#8B5E3C]/20"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {items.map((item) => (
        <Tab key={item.label} setPosition={setPosition} onClick={() => handleNav(item)}>
          {item.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({ children, setPosition, onClick }: { children: React.ReactNode; setPosition: any; onClick: () => void }) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10 block px-4 py-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase transition-colors duration-300 md:px-6 md:py-2.5 text-[#BFA899] hover:text-white cursor-pointer select-none"
    >
      {children}
    </li>
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
