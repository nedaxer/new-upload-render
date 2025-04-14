import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight, BarChart4, Clock, Zap, Download } from "lucide-react";

export default function MarketData() {
  const dataFeatures = [
    {
      icon: <BarChart4 className="h-10 w-10 text-[#0033a0]" />,
      title: "Real-Time Charts",
      description: "Access real-time price action with multiple timeframes and chart types. Apply technical indicators and drawing tools to analyze market movements."
    },
    {
      icon: <Clock className="h-10 w-10 text-[#0033a0]" />,
      title: "Economic Calendar",
      description: "Stay informed with our comprehensive economic calendar showing upcoming data releases, central bank decisions, and other market-moving events."
    },
    {
      icon: <Zap className="h-10 w-10 text-[#0033a0]" />,
      title: "Market News",
      description: "Get the latest market news and analysis from our expert team, covering all markets available on the Nadex platform."
    },
    {
      icon: <Download className="h-10 w-10 text-[#0033a0]" />,
      title: "Historical Data",
      description: "Download historical price data for research and backtesting purposes across all our available markets and timeframes."
    }
  ];

  const marketResources = [
    {
      title: "Forex Market Data",
      description: "Access currency pair data and analysis for major, minor, and exotic FX markets.",
      link: "/markets/forex"
    },
    {
      title: "Stock Indices Data",
      description: "US and global stock index data, including S&P 500, Dow Jones, NASDAQ, and more.",
      link: "/markets/stock-indices"
    },
    {
      title: "Commodities Data",
      description: "Price data for gold, silver, oil, and natural gas markets with technical analysis.",
      link: "/markets/commodities"
    },
    {
      title: "Economic Events Calendar",
      description: "Comprehensive schedule of economic releases with market impact ratings.",
      link: "/markets/events"
    }
  ];

  return (
    <PageLayout 
      title="Market Data" 
      subtitle="Access real-time and historical price data, charts, news, and analysis"
      bgImage="https://images.unsplash.com/photo-1640340434855-6084b1f4901c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Comprehensive Market Data Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataFeatures.map((feature, i) => (
              <div key={i} className="flex flex-col items-start p-6 bg-[#f5f5f5] rounded-lg">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Market-Specific Resources</h2>
          
          <div className="space-y-6">
            {marketResources.map((resource, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{resource.title}</h3>
                <p className="text-gray-700 mb-4">{resource.description}</p>
                <Link 
                  href={resource.link} 
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                >
                  View {resource.title} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Advanced Charts</h2>
          
          <div className="bg-[#f5f5f5] p-6 rounded-lg mb-6">
            <p className="mb-4">
              Our advanced charting package offers professional-grade tools and features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple chart types (candlestick, line, bar)</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>20+ technical indicators</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Drawing tools and annotations</span>
                </li>
              </ul>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple timeframes from 1-minute to weekly</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Save and load chart layouts</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Price alerts and notifications</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button
                asChild
                className="bg-[#0033a0] hover:bg-opacity-90 text-white font-semibold px-6 py-2"
              >
                <Link href="/platform/web-platform">Explore Our Trading Platform</Link>
              </Button>
            </div>
          </div>
          
          {/* Placeholder for chart image */}
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Advanced chart visualization would be displayed here</p>
          </div>
        </div>
        
        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Access to Professional Market Data</h2>
          <p className="mb-6">Open an account today to access our full suite of data and analysis tools.</p>
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
            <Link href="/platform/web-platform">View Platform Features</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}