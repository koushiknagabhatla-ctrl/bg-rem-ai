'use client';

import { motion } from 'framer-motion';

const brands = [
  'ADOBE', 'FIGMA', 'CANVA', 'SHOPIFY', 'SQUARESPACE', 'WEBFLOW', 'NOTION', 'LINEAR',
  'ADOBE', 'FIGMA', 'CANVA', 'SHOPIFY', 'SQUARESPACE', 'WEBFLOW', 'NOTION', 'LINEAR',
];

export function SocialProof() {
  return (
    <section className="py-12 border-y border-white/[0.04] bg-[#0A0A0F] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <p className="text-center text-[10px] font-mono tracking-[0.4em] uppercase text-[#4A4A57] mb-8">
          Trusted by creative teams worldwide
        </p>
        <div className="relative overflow-hidden">
          <div className="marquee-track">
            {brands.map((brand, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center px-12 text-lg font-display font-bold text-white/[0.08] hover:text-white/20 transition-colors duration-500 whitespace-nowrap select-none"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
