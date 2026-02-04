import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { BrandTicker } from "@/components/marketing/brand-ticker";
import { FeatureCards } from "@/components/marketing/feature-cards";
import { ValueProp } from "@/components/marketing/value-prop";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { CTA } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/30">
      <Navbar />
      <main className="flex-1">
        <Hero />
        {/* <BrandTicker /> */}
        <FeatureCards />
        <ValueProp />
        {/* <Pricing /> */}
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
