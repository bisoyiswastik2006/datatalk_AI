import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FactsStrip } from './components/FactsStrip';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { ProductPreview } from './components/ProductPreview';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-page text-main flex flex-col selection:bg-primary/20">
      {/* SaaS Navbar */}
      <Navbar />

      {/* Hero with Illustrative Preview */}
      <Hero />

      {/* Real-Facts Strip */}
      <FactsStrip />

      {/* 6 Core Feature Cards */}
      <Features />

      {/* 4 Illustrated Workflow Steps */}
      <HowItWorks />

      {/* Product Preview & Final CTA Band */}
      <ProductPreview />

      {/* Clean Section-Link Footer */}
      <Footer />
    </div>
  );
};
