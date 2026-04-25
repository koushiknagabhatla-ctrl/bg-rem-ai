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
    // Check if user navigated here with a hash (e.g. /#about, /#hero)
    // If so, DON'T redirect — they intentionally want to see the landing page
    const hasHash = typeof window !== 'undefined' && window.location.hash.length > 1;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !hasHash) {
        // Only auto-redirect if there's NO hash anchor
        router.replace('/tool');
      } else {
        setIsChecking(false);

        // If there's a hash, scroll to that section after render
        if (hasHash) {
          const hash = window.location.hash.replace('#', '');
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 1200); // Wait for preloader + GSAP init
        }
      }
    });

    // GSAP Scroll Configuration
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
