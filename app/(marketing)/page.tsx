// app/(marketing)/page.tsx
import Hero from '@/components/marketing/Hero';
import ProblemStatement from '@/components/marketing/ProblemStatement';
import Features from '@/components/marketing/Features';
import HowItWorks from '@/components/marketing/HowItWorks';
import UseCases from '@/components/marketing/UseCases';
import Pricing from '@/components/marketing/Pricing';
import FAQ from '@/components/marketing/FAQ';
import FinalCTA from '@/components/marketing/FinalCTA';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Problem Statement */}
        <ProblemStatement />

        {/* Features */}
        <Features />

        {/* How It Works */}
        <HowItWorks />

        {/* Use Cases */}
        <UseCases />

        {/* Pricing */}
        <Pricing />

        {/* FAQ */}
        <FAQ />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}