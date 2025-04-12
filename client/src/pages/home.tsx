import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSlider } from "@/components/hero-slider";
import { TradeOptions } from "@/components/trade-options";
import { MarketFeatures } from "@/components/market-features";
import { PlatformFeatures } from "@/components/platform-features";
import { LearningResources } from "@/components/learning-resources";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSlider />
        <TradeOptions />
        <MarketFeatures />
        <PlatformFeatures />
        <LearningResources />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
