import { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  bgColor?: string;
  bgImage?: string;
}

export const PageLayout = ({
  children,
  title,
  subtitle,
  bgColor = "#0033a0",
  bgImage,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24" style={{ backgroundColor: bgColor }}>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
            {subtitle && <p className="text-xl text-white opacity-90 max-w-3xl">{subtitle}</p>}
          </div>
          {bgImage && (
            <div className="absolute inset-0 opacity-30">
              <img src={bgImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
        </section>
        
        {/* Page Content */}
        <div className="py-12">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};