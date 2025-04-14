import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight, Smartphone, Tablet, BarChart3, Zap } from "lucide-react";

export default function MobileApp() {
  const appFeatures = [
    {
      title: "Trade On The Go",
      description: "Place trades, monitor positions, and manage your account from anywhere with our powerful mobile app.",
      icon: <Smartphone className="h-10 w-10 text-[#0033a0]" />,
    },
    {
      title: "Full Platform Features",
      description: "Access all the same markets, products, and trading tools available on our web platform.",
      icon: <Tablet className="h-10 w-10 text-[#0033a0]" />,
    },
    {
      title: "Advanced Charting",
      description: "Analyze markets with professional charting tools, indicators, and drawing features optimized for touch.",
      icon: <BarChart3 className="h-10 w-10 text-[#0033a0]" />,
    },
    {
      title: "Real-Time Alerts",
      description: "Stay updated with push notifications for price alerts, trade executions, and account activity.",
      icon: <Zap className="h-10 w-10 text-[#0033a0]" />,
    },
  ];

  const deviceSupport = [
    {
      name: "iOS Devices",
      requirements: [
        "iPhone 6s or newer",
        "iOS 13.0 or higher",
        "Optimized for all screen sizes",
        "Available on App Store",
      ],
    },
    {
      name: "Android Devices",
      requirements: [
        "Android 7.0 or higher",
        "Minimum 2GB RAM recommended",
        "Tablets and phones supported",
        "Available on Google Play",
      ],
    },
  ];

  return (
    <PageLayout 
      title="Mobile Trading App" 
      subtitle="Trade anywhere, anytime with our powerful mobile application"
      bgColor="#0033a0"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Mobile Trading Power</h2>
          
          <div className="mb-8">
            <p className="mb-4">
              The Nadex mobile app gives you the freedom to trade on the go, with the same powerful 
              features and limited-risk products available on our web platform. Never miss a trading 
              opportunity, even when you're away from your desk.
            </p>
            <p className="mb-6">
              Our intuitive mobile interface is designed for touch controls while maintaining the 
              advanced functionality serious traders demand.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {appFeatures.map((feature, i) => (
              <div key={i} className="flex items-start p-6 bg-[#f5f5f5] rounded-lg">
                <div className="mr-4">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* App Screenshot Placeholder */}
        <div className="mb-12">
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Mobile app interface visualization would be displayed here</p>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">Nadex mobile app on smartphone and tablet devices</p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">App Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#0033a0]">Trading Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Trade all Nadex products: Binary Options, Call Spreads, Touch Brackets, and Knock-Outs</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Access to all available markets including forex, stock indices, commodities, and events</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>One-tap order entry with built-in risk assessment</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Real-time position management and tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Close trades early to secure profits or limit losses</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#0033a0]">Analysis Tools</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Professional charting with multiple timeframes</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Technical indicators and drawing tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Economic calendar and market news</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Customizable watchlists for easy market monitoring</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Price alerts and custom notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Device Support</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deviceSupport.map((device, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-4 text-[#0033a0]">{device.name}</h3>
                <ul className="space-y-3">
                  {device.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start">
                      <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">How to Get Started</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
              <div className="text-3xl font-bold text-[#0033a0] mb-4">1</div>
              <h3 className="text-lg font-bold mb-2">Create Account</h3>
              <p className="text-gray-700 mb-4">Sign up for a Nadex account online or through the mobile app.</p>
              <Link 
                href="#" 
                className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center justify-center"
              >
                Open Account <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
              <div className="text-3xl font-bold text-[#0033a0] mb-4">2</div>
              <h3 className="text-lg font-bold mb-2">Download App</h3>
              <p className="text-gray-700 mb-4">Get the app from the App Store or Google Play Store.</p>
              <div className="flex flex-col items-center space-y-2">
                <Link 
                  href="#" 
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                >
                  Download for iOS <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                <Link 
                  href="#" 
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                >
                  Download for Android <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
              <div className="text-3xl font-bold text-[#0033a0] mb-4">3</div>
              <h3 className="text-lg font-bold mb-2">Log In & Trade</h3>
              <p className="text-gray-700 mb-4">Sign in to the app and start trading on the go.</p>
              <Link 
                href="/learn/getting-started" 
                className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center justify-center"
              >
                View App Tutorial <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Download our Mobile App Today</h2>
          <p className="mb-6">Trade anywhere, anytime with our powerful mobile trading platform.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              asChild
              className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-8 py-3"
            >
              <Link href="#">Download for iOS</Link>
            </Button>
            <Button
              asChild
              className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-8 py-3"
            >
              <Link href="#">Download for Android</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}