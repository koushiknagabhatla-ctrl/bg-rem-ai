'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Preloader } from '@/components/ui/Preloader';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Hero } from '@/components/sections/Hero';
import { SocialProof } from '@/components/sections/SocialProof';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { Performance } from '@/components/sections/Performance';
import { StatsRibbon } from '@/components/sections/StatsRibbon';
import { AboutSection } from '@/components/sections/AboutSection';
import { Testimonials } from '@/components/sections/Testimonials';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

export function LandingView() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Phase 1: Authentication Redirection
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/tool');
      } else {
        setIsChecking(false);
      }
    });

    // Phase 2: GSAP Scroll Configuration
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.config({
      ignoreMobileResize: true,
      syncInterval: 99
    });

  }, [router, supabase]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0C0806] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8B5E3C]/20 border-t-[#E8B98A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Preloader>
      <GradientBackground className="film-grain">
        <ScrollIndicator />
        <Hero />
        <SocialProof />
        <BeforeAfter />
        <div className="section-divider mx-6 md:mx-16" />
        <Performance />
        <StatsRibbon />
        <div className="section-divider mx-6 md:mx-16" />
        <AboutSection />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </GradientBackground>
    </Preloader>
  );
}
