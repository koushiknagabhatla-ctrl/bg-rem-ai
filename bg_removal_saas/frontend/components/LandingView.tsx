'use client';

import { Preloader } from '@/components/ui/Preloader';
import { Hero } from '@/components/sections/Hero';
import { SocialProof } from '@/components/sections/SocialProof';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { Performance } from '@/components/sections/Performance';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Testimonials } from '@/components/sections/Testimonials';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';

export function LandingView() {
  return (
    <Preloader>
      <div className="w-full min-h-screen bg-[#0A0A0F] text-white selection:bg-[#6C63FF]/30 selection:text-white">
        <Hero />
        <SocialProof />
        <BeforeAfter />
        <Performance />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </div>
    </Preloader>
  );
}
