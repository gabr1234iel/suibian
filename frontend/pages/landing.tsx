import Header from "@/components/Header";
import HeroSection from "@/components/Hero";
import HowItWorksSection from "@/components/HowItWorksSection";
import EaseOfUseSection from "@/components/EaseOfUseSection";
import MarketplacePreviewSection from "@/components/MarketplacePreviewSection";
import DualFeatureSection from "@/components/DualFeatureSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <HeroSection />
      <section id="how-it-works">
        <HowItWorksSection />
      </section>
      <section id="why-us">
        <EaseOfUseSection />
      </section>
      <section id="marketplace">
        <MarketplacePreviewSection />
      </section>
      <section id="for-everyone">
        <DualFeatureSection />
      </section>
      <Footer />
    </main>
  );
}
