import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight } from "lucide-react";

export default function Commodities() {
  const commodities = [
    {
      name: "Gold",
      description: "Precious metal with historical store of value",
      features: [
        "Safe-haven asset during economic uncertainty",
        "Hedge against inflation",
        "Trades 23 hours a day, 5 days a week",
        "Affected by interest rates and dollar strength",
      ],
    },
    {
      name: "Silver",
      description: "Precious metal with industrial applications",
      features: [
        "More volatile than gold",
        "Both industrial and investment demand",
        "Trades 23 hours a day, 5 days a week",
        "Follows gold but with higher volatility",
      ],
    },
    {
      name: "Crude Oil",
      description: "Global benchmark for oil prices",
      features: [
        "Affected by OPEC decisions and production data",
        "Sensitive to geopolitical events",
        "Available during US market hours",
        "Weekly inventory reports cause volatility",
      ],
    },
    {
      name: "Natural Gas",
      description: "Major energy commodity",
      features: [
        "Seasonal demand patterns",
        "Weather-dependent price action",
        "Weekly storage reports affect prices",
        "Higher volatility than other commodities",
      ],
    },
  ];

  return (
    <PageLayout 
      title="Commodities Markets" 
      subtitle="Trade gold, silver, oil, and natural gas with limited risk products"
      bgImage="https://images.unsplash.com/photo-1565014330668-92f006cb3a75?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#0033a0]">Trade Commodities on Nadex</h2>
          <p className="mb-4">
            Commodities trading gives you access to the world's most important physical goods markets. 
            On Nadex, you can trade precious metals and energy products with binary options, call spreads, and knock-outs - all with limited risk.
          </p>
          <p className="mb-6">
            Commodity markets offer unique trading opportunities based on supply and demand dynamics, 
            geopolitical events, and macroeconomic trends, with defined risk parameters on Nadex.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Benefits of Trading Commodities on Nadex</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Access gold, silver, oil, and natural gas markets</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>No need for futures contracts or physical delivery</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Limited risk with defined maximum loss</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple contract types and expirations</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Trading Opportunities</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade around economic data releases</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Position for inventory and production reports</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Capitalize on geopolitical events</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Diversify your trading portfolio with non-correlated assets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Available Commodities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commodities.map((commodity, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{commodity.name}</h3>
                <p className="text-gray-500 mb-4">{commodity.description}</p>
                <ul className="space-y-2 mb-4">
                  {commodity.features.map((feature, featIndex) => (
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
                  View {commodity.name} charts <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to trade Commodities?</h2>
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
            <Link href="/markets/commodities">View Market Data</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}