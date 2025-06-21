import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem("cookie-consent") === "accepted";
    
    // Show the banner if they haven't accepted yet
    if (!hasAcceptedCookies) {
      // Slight delay before showing the banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10003] bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto p-4 pb-20 md:pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="pr-8 mb-4 md:mb-0">
            <p className="text-sm text-gray-700">
              We use a range of cookies to give you the best possible user experience. By continuing to use any part of this website and/or the trading platform, you agree to our use of cookies. You can view both our Cookie and Privacy Policies by clicking the "Legal" link at the bottom of any page on our site.
            </p>
          </div>
          <div className="flex flex-shrink-0 space-x-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={declineCookies}
              className="text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            >
              Decline
            </Button>
            <Button 
              size="sm"
              onClick={acceptCookies}
              className="bg-[#0033a0] hover:bg-opacity-90 text-white"
            >
              Accept Cookies
            </Button>
          </div>
          <button 
            onClick={declineCookies} 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 md:hidden"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}