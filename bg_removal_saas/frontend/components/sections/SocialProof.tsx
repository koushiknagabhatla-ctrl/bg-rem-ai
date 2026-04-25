'use client';

import { motion } from 'framer-motion';

const brands = [
  'ADOBE', 'FIGMA', 'CANVA', 'SHOPIFY', 'SQUARESPACE', 'WEBFLOW', 'NOTION', 'LINEAR',
  'ADOBE', 'FIGMA', 'CANVA', 'SHOPIFY', 'SQUARESPACE', 'WEBFLOW', 'NOTION', 'LINEAR',
];

export function SocialProof() {
  return (
    <section className="py-14 border-y border-[#8B5E3C]/10 bg-[#0C0806] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <p className="text-center text-[10px] font-mono tracking-[0.4em] uppercase text-[#8B5E3C] mb-8">
          Trusted by creative teams worldwide
        </p>
        <div className="relative overflow-hidden marquee-container">
          <div className="marquee-track">
            {brands.map((brand, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center px-12 text-lg font-display font-bold text-[#F5EDE4]/15 hover:text-[#C4956A]/50 transition-colors duration-500 whitespace-nowrap select-none"
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
