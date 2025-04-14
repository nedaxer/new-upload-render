import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight } from "lucide-react";

export default function CallSpreads() {
  return (
    <PageLayout 
      title="Call Spreads" 
      subtitle="Limited risk alternative to traditional call options with built-in floor and ceiling levels"
      bgColor="#0033a0"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#0033a0]">What Are Call Spreads?</h2>
          <p className="mb-4">
            Call spreads on Nadex are limited-risk alternatives to traditional call options, with built-in floor and ceiling levels. 
            They provide a way to participate in market movements with predefined risk and potential profit.
          </p>
          <p className="mb-6">
            Unlike traditional options, Nadex call spreads are fully collateralized, which means you always know your maximum potential loss and profit before placing your trade.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Benefits of Call Spreads</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Limited risk with predefined maximum loss</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Defined profit potential with built-in ceiling</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Lower cost compared to binary options in some scenarios</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Partial outcomes based on where price settles in the range</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">How Call Spreads Work</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Choose a market and expiration time</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Select a call spread with floor and ceiling levels</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Buy if you think the market will rise, sell if you think it will fall</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Ability to close early to secure profits or limit losses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Available Call Spread Markets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-[#0033a0]">Forex</h3>
              <p className="mb-4">Trade call spreads on major, minor, and exotic currency pairs.</p>
              <Button 
                asChild
                variant="outline" 
                className="w-full border-[#0033a0] text-[#0033a0] hover:bg-[#0033a0] hover:text-white"
              >
                <Link href="/markets/forex">View Forex Markets</Link>
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-[#0033a0]">Stock Indices</h3>
              <p className="mb-4">Trade call spreads on major US and global stock indices.</p>
              <Button 
                asChild
                variant="outline" 
                className="w-full border-[#0033a0] text-[#0033a0] hover:bg-[#0033a0] hover:text-white"
              >
                <Link href="/markets/stock-indices">View Indices Markets</Link>
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-[#0033a0]">Commodities</h3>
              <p className="mb-4">Trade call spreads on gold, silver, oil, and natural gas.</p>
              <Button 
                asChild
                variant="outline" 
                className="w-full border-[#0033a0] text-[#0033a0] hover:bg-[#0033a0] hover:text-white"
              >
                <Link href="/markets/commodities">View Commodities Markets</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to trade Call Spreads?</h2>
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
            <Link href="/learn/getting-started">Learn More</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}