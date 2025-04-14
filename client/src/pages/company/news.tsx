import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, ArrowRight, Newspaper, FileText, Award } from "lucide-react";

export default function News() {
  const newsItems = [
    {
      id: 1,
      title: "Nadex Introduces New Mobile Trading Features",
      date: "April 2, 2025",
      excerpt: "Nadex has released a major update to its mobile trading app, introducing advanced charting capabilities, customizable alerts, and an enhanced user interface.",
      category: "Product Update",
      image: "https://images.unsplash.com/photo-1579226905180-636b76d96082?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
    },
    {
      id: 2,
      title: "Nadex Adds New Market Data Indicators",
      date: "March 15, 2025",
      excerpt: "Traders now have access to additional technical indicators and market analysis tools on the Nadex platform, enhancing their ability to make informed trading decisions.",
      category: "Platform Enhancement",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
    },
    {
      id: 3,
      title: "Nadex Reports Record Trading Volume in Q1 2025",
      date: "March 10, 2025",
      excerpt: "Nadex has reported record trading volumes for the first quarter of 2025, with significant growth across all product categories, particularly in forex and stock index markets.",
      category: "Company News",
      image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
    },
    {
      id: 4,
      title: "Nadex Expands Educational Webinar Series",
      date: "February 28, 2025",
      excerpt: "Nadex has expanded its educational offerings with a new series of webinars covering advanced trading strategies, risk management techniques, and market analysis.",
      category: "Education",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
    },
    {
      id: 5,
      title: "Nadex Enhances Security Features",
      date: "February 15, 2025",
      excerpt: "New security enhancements have been implemented across the Nadex platform, including improved two-factor authentication and advanced fraud detection systems.",
      category: "Security Update",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
    },
    {
      id: 6,
      title: "Nadex to Host Annual Trading Summit",
      date: "January 25, 2025",
      excerpt: "Nadex has announced dates for its annual Trading Summit, bringing together traders, industry experts, and Nadex staff for educational sessions and networking opportunities.",
      category: "Event",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
    },
  ];

  const pressReleases = [
    {
      title: "Nadex Announces Strategic Partnership with Market Data Provider",
      date: "March 20, 2025",
      link: "#",
    },
    {
      title: "Nadex Receives Industry Award for Trading Innovation",
      date: "February 5, 2025",
      link: "#",
    },
    {
      title: "Nadex Appoints New Chief Technology Officer",
      date: "January 12, 2025",
      link: "#",
    },
  ];

  const mediaContacts = {
    press: {
      name: "Media Relations Team",
      email: "press@nadex.com",
      phone: "+1 (888) 555-6666",
    },
    generalInquiries: {
      name: "Customer Support",
      email: "support@nadex.com",
      phone: "+1 (888) 555-7777",
    },
  };

  return (
    <PageLayout 
      title="News & Updates" 
      subtitle="The latest news, events, and announcements from Nadex"
      bgColor="#0033a0"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Latest News</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Featured News Item */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-[#f5f5f5] rounded-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img 
                      src={newsItems[0].image} 
                      alt={newsItems[0].title} 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-1/2">
                    <div className="flex items-center mb-2">
                      <span className="bg-[#0033a0] text-white text-xs px-2 py-1 rounded-full">{newsItems[0].category}</span>
                      <div className="flex items-center ml-3 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{newsItems[0].date}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#0033a0]">{newsItems[0].title}</h3>
                    <p className="text-gray-700 mb-4">{newsItems[0].excerpt}</p>
                    <Link 
                      href="#" 
                      className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                    >
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Other News Items */}
            {newsItems.slice(1).map((news) => (
              <div key={news.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-[#0033a0] text-white text-xs px-2 py-1 rounded-full">{news.category}</span>
                    <div className="flex items-center ml-3 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{news.date}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#0033a0]">{news.title}</h3>
                  <p className="text-gray-700 mb-4">{news.excerpt}</p>
                  <Link 
                    href="#" 
                    className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                  >
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button
              asChild
              className="bg-[#0033a0] hover:bg-opacity-90 text-white font-semibold px-6 py-2"
            >
              <Link href="#">View All News</Link>
            </Button>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Press Releases</h2>
          
          <div className="space-y-4 mb-8">
            {pressReleases.map((release, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <FileText className="text-[#0033a0] mt-1 mr-3 h-6 w-6 flex-shrink-0" />
                  <div>
                    <div className="flex items-center mb-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{release.date}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-[#0033a0]">{release.title}</h3>
                    <Link 
                      href={release.link} 
                      className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center text-sm"
                    >
                      Download Press Release <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="#" 
              className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center justify-center"
            >
              View All Press Releases <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Media Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Newspaper className="text-[#0033a0] h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold text-[#0033a0]">Press Kit</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Download official Nadex logos, executive headshots, platform screenshots, and other media resources.
              </p>
              <Link 
                href="#" 
                className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
              >
                Download Press Kit <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Award className="text-[#0033a0] h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold text-[#0033a0]">Company Facts</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Key information about Nadex, including our history, leadership, regulatory status, and product offerings.
              </p>
              <Link 
                href="#" 
                className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
              >
                View Company Facts <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <FileText className="text-[#0033a0] h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold text-[#0033a0]">White Papers</h3>
              </div>
              <p className="text-gray-700 mb-4">
                In-depth research and analysis on derivatives markets, trading strategies, and industry trends.
              </p>
              <Link 
                href="#" 
                className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
              >
                Browse White Papers <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Media Contacts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">Press Inquiries</h3>
              <p className="mb-4">For media inquiries, interview requests, and press materials:</p>
              <ul className="space-y-2">
                <li><span className="font-semibold">Contact:</span> {mediaContacts.press.name}</li>
                <li><span className="font-semibold">Email:</span> {mediaContacts.press.email}</li>
                <li><span className="font-semibold">Phone:</span> {mediaContacts.press.phone}</li>
              </ul>
            </div>
            
            <div className="bg-[#f5f5f5] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#0033a0]">General Inquiries</h3>
              <p className="mb-4">For general questions about Nadex:</p>
              <ul className="space-y-2">
                <li><span className="font-semibold">Contact:</span> {mediaContacts.generalInquiries.name}</li>
                <li><span className="font-semibold">Email:</span> {mediaContacts.generalInquiries.email}</li>
                <li><span className="font-semibold">Phone:</span> {mediaContacts.generalInquiries.phone}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated with Nadex</h2>
          <p className="mb-6">Subscribe to our newsletter to receive the latest news, market updates, and educational content.</p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-grow px-4 py-3 rounded-md focus:outline-none"
              />
              <Button
                className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-6 py-3"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}