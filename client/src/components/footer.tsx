import { Link } from "wouter";
import { footerLinks } from "@/lib/constants";
import { Facebook, Twitter, Youtube, Linkedin, Instagram, Apple, PlayCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#003366] text-white py-12">
      <div className="container mx-auto px-4">
        {/* Top Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Markets */}
          <div>
            <h3 className="text-lg font-bold mb-4">Markets</h3>
            <ul className="space-y-2">
              {footerLinks.markets.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-bold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-bold mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle Footer */}
        <div className="border-t border-b border-gray-700 py-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#ff5900] mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span>+1 (866) 596-2339</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff5900] mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span>customerservice@nadex.com</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff5900] mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span>
                    200 West Jackson Blvd, Suite 1400
                    <br />
                    Chicago, IL 60606, USA
                  </span>
                </li>
              </ul>
            </div>

            {/* Social & Apps */}
            <div>
              <h3 className="text-lg font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4 mb-6">
                <Link href="#" className="text-white hover:text-[#ff5900]">
                  <Facebook className="w-6 h-6" />
                </Link>
                <Link href="#" className="text-white hover:text-[#ff5900]">
                  <Twitter className="w-6 h-6" />
                </Link>
                <Link href="#" className="text-white hover:text-[#ff5900]">
                  <Youtube className="w-6 h-6" />
                </Link>
                <Link href="#" className="text-white hover:text-[#ff5900]">
                  <Linkedin className="w-6 h-6" />
                </Link>
                <Link href="#" className="text-white hover:text-[#ff5900]">
                  <Instagram className="w-6 h-6" />
                </Link>
              </div>

              <h3 className="text-lg font-bold mb-4">Mobile App</h3>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link
                  href="#"
                  className="bg-black rounded-md px-4 py-2 flex items-center"
                >
                  <Apple className="w-6 h-6 mr-2" />
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="bg-black rounded-md px-4 py-2 flex items-center"
                >
                  <PlayCircle className="w-6 h-6 mr-2" />
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div>
          <div className="text-sm text-gray-400 mb-4">
            <p className="mb-2">
              Trading on Nadex involves financial risk and may not be appropriate for all investors. The information presented here is for information and educational purposes only and should not be considered an offer or solicitation to buy or sell any financial instrument on Nadex or elsewhere.
            </p>
            <p>
              © 2023 North American Derivatives Exchange, Inc. All rights reserved. Nadex is a registered trademark of IG Group Holdings plc.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start space-x-4 text-sm text-gray-400">
            {footerLinks.legal.map((link, index) => (
              <Link key={index} href={link.href} className="hover:text-white mb-2">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
