import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { FeatureCards } from "@/components/marketing/feature-cards";
import { CTA } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}