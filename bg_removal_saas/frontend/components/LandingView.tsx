'use client';

import { Preloader } from '@/components/ui/Preloader';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Hero } from '@/components/sections/Hero';
import { SocialProof } from '@/components/sections/SocialProof';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { Performance } from '@/components/sections/Performance';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { AboutSection } from '@/components/sections/AboutSection';
import { Testimonials } from '@/components/sections/Testimonials';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';

export function LandingView() {
  return (
    <Preloader>
      <GradientBackground className="min-h-screen text-white selection:bg-[#C4956A]/30 selection:text-white">
        <Hero />
        <SocialProof />
        <BeforeAfter />
        <Performance />
        <HowItWorks />
        <AboutSection />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </GradientBackground>
    </Preloader>
  );
}
