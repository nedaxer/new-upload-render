import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, ArrowRight, Building, Users, GraduationCap, Shield } from "lucide-react";

export default function About() {
  const companyValues = [
    {
      title: "Integrity",
      description: "We operate with transparency and honesty in all our business practices, maintaining the highest ethical standards.",
      icon: <Shield className="h-10 w-10 text-[#0033a0]" />,
    },
    {
      title: "Innovation",
      description: "We continuously develop new products and improve our platform to provide the best trading experience.",
      icon: <Building className="h-10 w-10 text-[#0033a0]" />,
    },
    {
      title: "Education",
      description: "We are committed to providing traders with the knowledge they need to make informed trading decisions.",
      icon: <GraduationCap className="h-10 w-10 text-[#0033a0]" />,
    },
    {
      title: "Customer Focus",
      description: "We prioritize our members' needs and strive to provide excellent service and support.",
      icon: <Users className="h-10 w-10 text-[#0033a0]" />,
    },
  ];

  const milestones = [
    {
      year: "2004",
      title: "Company Founded",
      description: "Nadex was founded as HedgeStreet, pioneering the concept of limited-risk derivatives for retail traders.",
    },
    {
      year: "2007",
      title: "Acquisition by IG Group",
      description: "HedgeStreet was acquired by IG Group Holdings plc, a global leader in online trading.",
    },
    {
      year: "2009",
      title: "Relaunch as Nadex",
      description: "The company was relaunched as the North American Derivatives Exchange (Nadex), with an enhanced trading platform.",
    },
    {
      year: "2011",
      title: "Introduction of Binary Options",
      description: "Nadex introduced binary options trading on a regulated US exchange for the first time.",
    },
    {
      year: "2014",
      title: "Launch of Mobile Trading",
      description: "The Nadex mobile app was launched, allowing members to trade on the go.",
    },
    {
      year: "2016",
      title: "Introduction of Touch Brackets",
      description: "Nadex introduced Touch Brackets, providing traders with new limited-risk trading opportunities.",
    },
    {
      year: "2020",
      title: "Platform Expansion",
      description: "Major platform upgrades and expansion of available markets and trading instruments.",
    },
    {
      year: "2023",
      title: "Continued Innovation",
      description: "Introduction of new trading products and enhanced trading platform features.",
    },
  ];

  return (
    <PageLayout 
      title="About Nadex" 
      subtitle="A regulated US exchange offering limited-risk derivative products"
      bgColor="#0033a0"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Our Company</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="mb-4">
                The North American Derivatives Exchange (Nadex) is a regulated US exchange offering 
                retail traders innovative ways to participate in the financial markets with limited risk.
              </p>
              <p className="mb-4">
                Based in Chicago, Nadex operates under the regulatory oversight of the Commodity Futures 
                Trading Commission (CFTC), ensuring a fair, transparent, and secure trading environment.
              </p>
              <p>
                We specialize in short-term, limited-risk derivative products including binary options, 
                call spreads, and knock-outs on a range of global markets including forex, stock indices, 
                commodities, and economic events.
              </p>
            </div>
            
            {/* Company Image Placeholder */}
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-600">Nadex headquarters image would be displayed here</p>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Our Mission</h2>
          
          <div className="bg-[#f5f5f5] p-8 rounded-lg text-center mb-8">
            <p className="text-xl italic mb-6">
              "To provide retail traders access to the financial markets through innovative, limited-risk 
              derivative products on a secure, regulated exchange."
            </p>
            <div className="flex justify-center space-x-4">
              <div className="h-1 w-12 bg-[#0033a0]"></div>
              <div className="h-1 w-12 bg-[#ff5900]"></div>
              <div className="h-1 w-12 bg-[#0033a0]"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyValues.map((value, i) => (
              <div key={i} className="flex items-start p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="mr-4">{value.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Our History</h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#0033a0] transform md:translate-x-[-0.5px]"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 pb-8">
                    <div className={`md:px-8 ${i % 2 === 0 ? 'md:pl-0 md:pr-16' : 'md:pr-0 md:pl-16'}`}>
                      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="text-lg font-bold text-[#ff5900] mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{milestone.title}</h3>
                        <p className="text-gray-700">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-0 md:left-1/2 mt-6 transform md:translate-x-[-50%] flex items-center justify-center">
                    <div className="bg-[#ff5900] h-4 w-4 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Leadership Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leadership team placeholders */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-[#f5f5f5] p-6 rounded-lg text-center">
                <div className="bg-gray-300 h-48 w-48 mx-auto rounded-full mb-4 flex items-center justify-center">
                  <p className="text-gray-600">Photo</p>
                </div>
                <h3 className="text-xl font-bold mb-1 text-[#0033a0]">Executive Name</h3>
                <p className="text-[#ff5900] font-medium mb-3">Position Title</p>
                <p className="text-gray-700 text-sm">
                  Brief biography about the executive's experience and background would appear here.
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/company/careers" 
              className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center justify-center"
            >
              View career opportunities at Nadex <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Why Choose Nadex</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="text-[#ff5900] mt-1 mr-3 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-1 text-[#0033a0]">Regulated US Exchange</h3>
                <p className="text-gray-700">
                  Trade with confidence on a CFTC-regulated exchange with member funds held in segregated US bank accounts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="text-[#ff5900] mt-1 mr-3 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-1 text-[#0033a0]">Limited Risk by Design</h3>
                <p className="text-gray-700">
                  All our products feature built-in risk parameters, so you always know your maximum potential loss before you trade.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="text-[#ff5900] mt-1 mr-3 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-1 text-[#0033a0]">Innovative Products</h3>
                <p className="text-gray-700">
                  Our unique product offerings provide traders with opportunities not available on other platforms.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="text-[#ff5900] mt-1 mr-3 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-1 text-[#0033a0]">Educational Resources</h3>
                <p className="text-gray-700">
                  Comprehensive learning materials, webinars, and tutorials to help traders of all experience levels.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="text-[#ff5900] mt-1 mr-3 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-1 text-[#0033a0]">Advanced Trading Platform</h3>
                <p className="text-gray-700">
                  Professional-grade charting and analysis tools, available on web and mobile platforms.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Nadex Community</h2>
          <p className="mb-6">Experience trading on a regulated US exchange with limited risk products.</p>
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
            <Link href="/company/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}