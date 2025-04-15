import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, HelpCircle, MessageSquare, Shield, Zap } from "lucide-react";

export default function Contact() {
  const contactOptions = [
    {
      title: "General Inquiries",
      description: "Questions about our platform, our products, or how to get started?",
      icon: <HelpCircle className="h-10 w-10 text-[#0033a0]" />,
      contact: {
        email: "info@cryptotrading.com",
        phone: "Contact via email or form",
      },
    },
    {
      title: "Customer Support",
      description: "Account-related questions, technical issues, or trading assistance.",
      icon: <MessageSquare className="h-10 w-10 text-[#0033a0]" />,
      contact: {
        email: "support@cryptotrading.com",
        phone: "Contact via email or form",
      },
    },
    {
      title: "Security & Compliance",
      description: "Questions about KYC, account security, or regulatory matters.",
      icon: <Shield className="h-10 w-10 text-[#0033a0]" />,
      contact: {
        email: "security@cryptotrading.com",
        phone: "Contact via email or form",
      },
    },
    {
      title: "Technical Analysis Team",
      description: "Help with chart analysis, indicators, or trading strategies.",
      icon: <Zap className="h-10 w-10 text-[#0033a0]" />,
      contact: {
        email: "analysis@cryptotrading.com",
        phone: "Contact via email or form",
      },
    },
  ];

  const officeLocations = [
    {
      name: "San Francisco Headquarters",
      address: [
        "100 Market Street",
        "Suite 800",
        "San Francisco, CA 94105",
        "USA",
      ],
      phone: "Contact via email or form",
      email: "info@cryptotrading.com",
      hours: "Monday - Friday: 8:00 AM - 5:00 PM PT",
    },
    {
      name: "Singapore Office",
      address: [
        "1 Raffles Place",
        "#20-01 Tower 2",
        "Singapore 048616",
      ],
      phone: "Contact via email or form",
      email: "asia@cryptotrading.com",
      hours: "Monday - Friday: 9:00 AM - 6:00 PM SGT",
    },
  ];

  const supportHours = [
    {
      day: "Monday - Friday",
      hours: "24 Hours (Live Support)",
    },
    {
      day: "Saturday",
      hours: "9:00 AM - 5:00 PM ET",
    },
    {
      day: "Sunday",
      hours: "9:00 AM - 5:00 PM ET",
    },
  ];

  const faqs = [
    {
      question: "How do I open an account?",
      answer: "Opening an account is easy. Click the 'Open Account' button at the top of our website and follow the step-by-step registration process. You'll need to provide some personal information and complete our identity verification process to comply with regulatory requirements.",
    },
    {
      question: "What are the minimum deposit requirements?",
      answer: "The minimum initial deposit to open an account is $100. After your account is open, there is no minimum for subsequent deposits. We accept deposits via bank transfer, credit/debit cards, and several cryptocurrencies.",
    },
    {
      question: "How long does account verification take?",
      answer: "Basic account verification is instant, allowing you to start trading with limited functionality. Full verification typically takes 24-48 hours after all required documents are submitted. You'll receive an email notification once your account is fully verified.",
    },
    {
      question: "How do I reset my password?",
      answer: "To reset your password, click the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password. For security purposes, password reset links expire after 24 hours.",
    },
    {
      question: "Are my digital assets secure on your platform?",
      answer: "We implement industry-leading security measures including cold storage for 95% of assets, two-factor authentication, address whitelisting, and regular security audits. Additionally, we maintain an insurance fund to protect against potential security breaches.",
    },
  ];

  return (
    <PageLayout 
      title="Contact Us" 
      subtitle="Get in touch with our team for any questions or assistance"
      bgColor="#0033a0"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Get in Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {contactOptions.map((option, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="mr-4">{option.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{option.title}</h3>
                    <p className="text-gray-700">{option.description}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-[#0033a0] mr-2" />
                    <span>{option.contact.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-[#0033a0] mr-2" />
                    <span>{option.contact.email}</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full bg-[#0033a0] hover:bg-opacity-90 text-white"
                >
                  <Link href={`mailto:${option.contact.email}`}>Email Us</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Contact Form</h2>
          
          <div className="bg-[#f5f5f5] p-6 rounded-lg">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    id="subject" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  >
                    <option value="">Select a subject</option>
                    <option value="account">Account Inquiry</option>
                    <option value="trading">Trading Question</option>
                    <option value="funding">Funding Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cryptocurrency" className="block text-sm font-medium text-gray-700 mb-1">Cryptocurrency of Interest</label>
                  <select 
                    id="cryptocurrency" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  >
                    <option value="">Select a cryptocurrency</option>
                    <option value="bitcoin">Bitcoin (BTC)</option>
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="solana">Solana (SOL)</option>
                    <option value="cardano">Cardano (ADA)</option>
                    <option value="ripple">XRP (XRP)</option>
                    <option value="avalanche">Avalanche (AVAX)</option>
                    <option value="polkadot">Polkadot (DOT)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={5} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  placeholder="Enter your message here"
                ></textarea>
              </div>
              
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="privacy" 
                  className="mt-1 mr-2"
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  I agree to the <Link href="/legal/privacy" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">Privacy Policy</Link> and consent to being contacted about my inquiry.
                </label>
              </div>
              
              <div>
                <Button
                  className="w-full bg-[#0033a0] hover:bg-opacity-90 text-white font-semibold py-3"
                >
                  Submit Message
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Office Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {officeLocations.map((office, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-4 text-[#0033a0]">{office.name}</h3>
                
                <div className="flex items-start mb-3">
                  <MapPin className="h-5 w-5 text-[#0033a0] mr-2 mt-1" />
                  <div>
                    {office.address.map((line, lineIndex) => (
                      <div key={lineIndex}>{line}</div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 text-[#0033a0] mr-2" />
                  <span>{office.phone}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 text-[#0033a0] mr-2" />
                  <span>{office.email}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#0033a0] mr-2" />
                  <span>{office.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Support Hours</h2>
          
          <div className="bg-[#f5f5f5] p-6 rounded-lg">
            <p className="mb-4">
              Our customer support team is available during the following hours:
            </p>
            
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-[#0033a0] text-white">
                  <th className="p-2 text-left">Day</th>
                  <th className="p-2 text-left">Hours</th>
                </tr>
              </thead>
              <tbody>
                {supportHours.map((schedule, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                    <td className="p-2 border-t border-gray-300">{schedule.day}</td>
                    <td className="p-2 border-t border-gray-300">{schedule.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <p className="text-sm text-gray-700">
              * Hours are subject to change during holidays. Please check our website for holiday schedules.
            </p>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-2 text-[#0033a0]">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/learn/getting-started" 
              className="text-[#0033a0] hover:text-[#ff5900] font-semibold inline-flex items-center"
            >
              View More FAQs in Our Knowledge Base
            </Link>
          </div>
        </div>

        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Crypto Trading?</h2>
          <p className="mb-6">Open an account today and experience our advanced trading platform with powerful charting tools.</p>
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