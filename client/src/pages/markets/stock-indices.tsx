import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight } from "lucide-react";

export default function StockIndices() {
  const indices = [
    {
      name: "US 500 (S&P 500)",
      description: "Tracks 500 large US companies",
      features: [
        "Most widely followed equity index",
        "Represents about 80% of available US market cap",
        "Available during US market hours",
        "Popular for day trading",
      ],
    },
    {
      name: "Wall Street 30 (Dow Jones)",
      description: "Tracks 30 large US blue-chip companies",
      features: [
        "Oldest continuous US market index",
        "Price-weighted index",
        "Available during US market hours",
        "Less volatile than tech-heavy indices",
      ],
    },
    {
      name: "US Tech 100 (NASDAQ)",
      description: "Tracks largest non-financial companies on NASDAQ",
      features: [
        "Technology and growth-focused index",
        "Higher volatility and opportunity",
        "Available during US market hours",
        "Popular for short-term trading",
      ],
    },
    {
      name: "FTSE 100",
      description: "Tracks 100 largest companies on London Stock Exchange",
      features: [
        "Major European index",
        "Represents multinational companies",
        "Available during UK market hours",
        "Affected by Brexit developments",
      ],
    },
  ];

  return (
    <PageLayout 
      title="Stock Indices Markets" 
      subtitle="Trade major US and global stock indices with limited risk products"
      bgImage="https://images.unsplash.com/photo-1535320903710-d993d3d77d29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#0033a0]">Trade Stock Indices on Nadex</h2>
          <p className="mb-4">
            Stock index trading gives you exposure to entire markets or sectors without having to buy individual stocks. 
            On Nadex, you can trade major US and global indices with binary options, call spreads, and knock-outs - all with limited risk.
          </p>
          <p className="mb-6">
            Our indices products let you take positions on market direction with defined risk parameters, whether you're 
            day trading on short-term price movements or looking at longer-term market trends.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Benefits of Trading Indices on Nadex</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade major US and global indices with limited risk</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Contracts starting as low as $1, with no commissions</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple expiration times to match your trading strategy</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade from your desktop or mobile device</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Trading Opportunities</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Day trade on intraday price action and volatility</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Position around economic data releases</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade on earnings season trends</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Diversify your trading portfolio across global markets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Available Stock Indices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indices.map((index, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{index.name}</h3>
                <p className="text-gray-500 mb-4">{index.description}</p>
                <ul className="space-y-2 mb-4">
                  {index.features.map((feature, featIndex) => (
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
                  View {index.name} charts <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to trade Stock Indices?</h2>
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
            <Link href="/markets/stock-indices">View Market Data</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}