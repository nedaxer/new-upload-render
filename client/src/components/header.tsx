import { useState } from "react";
import { Link } from "wouter";
import { navItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, X } from "lucide-react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Header with Logo and Buttons */}
        <div className="flex justify-between items-center py-4">
          <div>
            {/* Logo */}
            <Link href="/" className="block">
              <div className="text-[#0033a0] font-bold text-2xl">NADEX</div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Auth Links */}
            <Link href="#" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">
              Log In
            </Link>
            <Button className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-5 py-2 rounded-md">
              Open Account
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-[#0033a0] focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:block py-2">
          <ul className="flex">
            {navItems.map((item, index) => (
              <li key={index} className="relative mr-6 group">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[#333333] hover:text-[#0033a0] font-medium flex items-center">
                      {item.title} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white rounded-md p-2 border border-gray-200 mt-1 min-w-[200px]">
                    {item.items.map((subItem, subIndex) => (
                      <DropdownMenuItem key={subIndex} asChild>
                        <Link
                          href={subItem.href}
                          className="block py-2 px-4 hover:bg-[#f5f5f5] hover:text-[#0033a0] rounded"
                        >
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-3 border-y border-gray-200 py-4 mb-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-[#333333] hover:text-[#0033a0] py-2 font-medium flex justify-between items-center"
                >
                  {item.title} <ChevronDown className="h-4 w-4" />
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="#" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">
                Log In
              </Link>
              <Button className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-5 py-3 rounded-md w-full">
                Open Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
