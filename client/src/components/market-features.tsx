import { marketFeatures } from "@/lib/constants";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

// Custom icon component to map icon names to JSX
const DynamicIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'exchange-dollar':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M7 10V7a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v0" />
          <circle cx="12" cy="14" r="8" />
          <path d="M12 10.5v7" />
          <path d="m9 13 3-2.5 3 2.5" />
        </svg>
      );
    case 'line-chart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    case 'oil':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M14 13.348C14 10.7666 18 8.9999 18 5.9999C18 3.7899 16.21 1.9999 14 1.9999C11.79 1.9999 10 3.7899 10 5.9999C10 8.9999 14 10.7666 14 13.348Z" />
          <path d="M14 14C10.686 14 8 16.686 8 20C8 23.314 10.686 26 14 26C17.314 26 20 23.314 20 20C20 16.686 17.314 14 14 14Z" />
        </svg>
      );
    case 'calendar-event':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="8" y="14" width="8" height="6" />
        </svg>
      );
    default:
      return <div className="w-6 h-6" />;
  }
};

export const MarketFeatures = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#0033a0]">
          Popular Markets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketFeatures.map((feature, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl text-[#0033a0] mr-3">
                  <DynamicIcon name={feature.icon} />
                </span>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <p className="mb-4 text-[#666666]">{feature.description}</p>
              <Link
                href={feature.link.href}
                className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center text-sm"
              >
                {feature.link.label} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
