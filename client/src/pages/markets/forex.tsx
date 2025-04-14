import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight } from "lucide-react";

export default function Forex() {
  const forexPairs = [
    {
      name: "EUR/USD",
      description: "Euro / US Dollar",
      features: [
        "Major currency pair",
        "Highest traded volume",
        "Low spreads",
        "Available 23 hours a day",
      ],
    },
    {
      name: "GBP/USD",
      description: "British Pound / US Dollar",
      features: [
        "Major currency pair",
        "High liquidity",
        "Known as 'Cable'",
        "Available 23 hours a day",
      ],
    },
    {
      name: "USD/JPY",
      description: "US Dollar / Japanese Yen",
      features: [
        "Major currency pair",
        "Popular for carry trades",
        "Influenced by Bank of Japan policy",
        "Available 23 hours a day",
      ],
    },
    {
      name: "USD/CAD",
      description: "US Dollar / Canadian Dollar",
      features: [
        "Major currency pair",
        "Influenced by commodity prices",
        "Known as 'Loonie'",
        "Available 23 hours a day",
      ],
    },
  ];

  return (
    <PageLayout 
      title="Forex Markets" 
      subtitle="Trade major, minor and exotic currency pairs with limited risk products"
      bgImage="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#0033a0]">Trade Forex on Nadex</h2>
          <p className="mb-4">
            Forex trading involves buying one currency while simultaneously selling another. On Nadex, 
            you can trade forex with binary options, call spreads, and knock-outs - all with limited risk.
          </p>
          <p className="mb-6">
            We offer a range of major, minor, and exotic currency pairs, with expiration times ranging 
            from 5 minutes to one week, giving you flexibility to suit your trading style.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Benefits of Trading Forex on Nadex</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Limited risk by design - never lose more than your initial investment</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade with contracts as low as $1, with no commissions</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple expiration times from 5 minutes to one week</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade on a regulated US exchange with secure funds</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Choose Your Trading Style</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Binary Options - simple yes/no market propositions</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Call Spreads - floor and ceiling limits with partial outcomes</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Knock-Outs - trade with leverage while maintaining risk controls</span>
                </li>
              </ul>
              <div className="mt-4">
                <Link 
                  href="#" 
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center text-sm"
                >
                  Learn more about our products <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Available Currency Pairs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forexPairs.map((pair, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{pair.name}</h3>
                <p className="text-gray-500 mb-4">{pair.description}</p>
                <ul className="space-y-2 mb-4">
                  {pair.features.map((feature, featIndex) => (
                    <li key={featIndex} className="flex items-start">
                      <Check className="text-[#ff5900] mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="#" 
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center text-sm"
                >
                  View {pair.name} charts <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to trade Forex?</h2>
          <p className="mb-6">Open an account today and start trading with limited risk.</p>
          <Button
            asChild
            className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-8 py-3"
          >
            <Link href="#">Open Account</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="ml-4 bg-transparent border border-white hover:bg-white hover:bg-opacity-20 text-white font-semibold px-8 py-3"
          >
            <Link href="/markets/forex">View Market Data</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}