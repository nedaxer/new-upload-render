import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight, Calendar } from "lucide-react";

export default function Events() {
  const eventMarkets = [
    {
      name: "Federal Funds Rate",
      description: "Predict the Fed's interest rate decision",
      nextDate: "June 12, 2025",
      features: [
        "8 FOMC meetings per year",
        "High market impact",
        "Binary options available before announcement",
        "Trade market expectations vs reality",
      ],
    },
    {
      name: "Nonfarm Payrolls",
      description: "Predict US employment numbers",
      nextDate: "May 2, 2025",
      features: [
        "Released first Friday of each month",
        "Major market mover for USD pairs",
        "Binary options available before announcement",
        "Opportunity for short-term volatility trading",
      ],
    },
    {
      name: "Jobless Claims",
      description: "Weekly US unemployment claims data",
      nextDate: "Every Thursday",
      features: [
        "Weekly release schedule",
        "Leading economic indicator",
        "Short-term market impact",
        "Binary options with same-day expiration",
      ],
    },
    {
      name: "GDP",
      description: "US Gross Domestic Product releases",
      nextDate: "April 25, 2025",
      features: [
        "Preliminary, advanced, and final releases",
        "Quarterly economic performance indicator",
        "Significant impact on market sentiment",
        "Multiple contract durations available",
      ],
    },
  ];

  return (
    <PageLayout 
      title="Economic Events Markets" 
      subtitle="Trade major economic events and announcements with limited risk"
      bgImage="https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#0033a0]">Trade Economic Events on Nadex</h2>
          <p className="mb-4">
            Event markets let you trade on the outcomes of important economic announcements and data releases. 
            On Nadex, you can position yourself before high-impact events with binary options, 
            providing a unique way to trade economic developments with strictly limited risk.
          </p>
          <p className="mb-6">
            Economic event trading offers specific opportunities to trade around scheduled releases 
            that often cause significant market movements across multiple asset classes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Benefits of Trading Events on Nadex</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade economic announcements directly</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Limited risk with predefined maximum loss</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Binary options based on economic data outcomes</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>No overnight exposure required</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">How Event Markets Work</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Contracts based on specific economic number thresholds</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade until just before the official announcement</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Settlement based on the official data release</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade market expectations vs actual results</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Available Event Markets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventMarkets.map((event, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{event.name}</h3>
                <p className="text-gray-500 mb-2">{event.description}</p>
                <div className="flex items-center mb-4 text-sm text-[#0033a0]">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Next release: {event.nextDate}</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {event.features.map((feature, featIndex) => (
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
                  View {event.name} details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to trade Economic Events?</h2>
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
            <Link href="/markets/events">View Economic Calendar</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}