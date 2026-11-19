import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { LiveDemo } from './components/LiveDemo';
import { AboutSection } from './components/AboutSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-page text-main flex flex-col selection:bg-primary/20">
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Features Section */}
      <Features />

      {/* 4. How It Works Section */}
      <HowItWorks />

      {/* 5. Live Demo Section */}
      <LiveDemo />

      {/* 6. About DataTalk AI Section */}
      <AboutSection />

      {/* 7. Call-to-Action Section */}
      <CtaSection />

      {/* 8. Footer */}
      <Footer />
    </div>
  );
};
