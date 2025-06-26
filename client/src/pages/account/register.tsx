import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, InfoIcon, MailIcon, LockIcon, UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    receiveUpdates: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "You must accept the terms and conditions to create an account.",
        variant: "destructive",
      });
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      console.log('Attempting registration...');
      
      const registrationData = {
        // Use email as username for simplicity
        username: formData.email,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      
      console.log('Registration payload:', { ...registrationData, password: '***' });
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('Registration response status:', response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle error
        let errorMessage = "An unexpected error occurred. Please try again.";
        let errorDetail = "";
        
        if (response.status === 409) {
          if (data.message === "Email already exists") {
            errorMessage = "This email address is already registered";
            errorDetail = "You already have an account with this email. Please use the login page to access your account or use a different email address.";
          } else if (data.message === "Username already exists") {
            errorMessage = "This username is already taken";
            errorDetail = "Please choose a different username for your account.";
          } else {
            errorMessage = data.message || "Account already exists";
            errorDetail = "It looks like you already have an account. Please try logging in instead.";
          }
        } else if (response.status === 400) {
          errorMessage = "Registration information is incomplete";
          errorDetail = "Please make sure all required fields are filled correctly. Check that your password meets all requirements.";
        }
        
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Show additional detail if available
        if (errorDetail) {
          setTimeout(() => {
            toast({
              title: "What to do next",
              description: errorDetail,
            });
          }, 1000);
        }
        
        setIsLoading(false);
        return;
      }
      
      // Success - account created and ready to use
      toast({
        title: "Welcome to Nedaxer!",
        description: "Your account has been created successfully.",
      });
      
      // Show toast with login info
      toast({
        title: "Your Login Information",
        description: `Username: ${data.user.email}\nPlease use your email address to log in.`,
        duration: 7000, // Show for longer
      });
      
      console.log("Registration successful, user is now logged in");
      
      // Store email as username in localStorage for convenience
      localStorage.setItem('lastUsername', data.user.email);
      
      // Invalidate auth query to refresh user state immediately
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Force refetch auth data to ensure user state is current
      await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      
      // Small delay to ensure auth state is synced
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Immediate redirect to mobile home page
      console.log('Taking user to mobile home page');
      
      // Use wouter's setLocation for proper routing
      setLocation('/mobile');
      
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title="Create Account"
      subtitle="Join Nedaxer cryptocurrency trading platform"
      bgColor="linear-gradient(135deg, #f0f4f9 0%, #e6f0fb 100%)"
    >
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-blue-50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <UserIcon className="h-8 w-8 text-[#0033a0]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Your Account</h2>
          <p className="text-gray-500">Join thousands of traders on the Nedaxer platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name<span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name<span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address<span className="text-red-500">*</span></Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password<span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password<span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0033a0]"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md flex items-start shadow-sm">
                <InfoIcon className="h-5 w-5 text-[#0033a0] mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-[#0033a0] mb-2">Password Requirements:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="acceptTerms" 
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                    }
                    className="mt-1 text-[#0033a0] border-gray-300"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm leading-tight text-gray-700"
                  >
                    I have read and agree to the{" "}
                    <Link href="/legal/terms" className="text-[#0033a0] hover:text-[#ff5900] font-medium">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/legal/privacy" className="text-[#0033a0] hover:text-[#ff5900] font-medium">
                      Privacy Policy
                    </Link>
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="receiveUpdates" 
                    name="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, receiveUpdates: checked as boolean }))
                    }
                    className="mt-1 text-[#0033a0] border-gray-300"
                  />
                  <label
                    htmlFor="receiveUpdates"
                    className="text-sm leading-tight text-gray-700"
                  >
                    I would like to receive updates on cryptocurrency market news, trading opportunities, and platform enhancements (optional)
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0033a0] hover:bg-[#002680] text-white py-2.5 font-medium rounded-md transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full flex flex-col bg-gradient-to-br from-[#0033a0] to-[#001a60] text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Why Join Nedaxer?</h3>
              
              <ul className="space-y-4 mb-auto">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Trade cryptocurrencies with limited risk</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Advanced trading tools for all skill levels</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Free educational resources and webinars</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Secure platform with multi-layer protection</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>24/7 customer support</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-blue-400">
                <div className="bg-white/10 p-4 rounded-md backdrop-blur-sm">
                  <p className="text-sm italic mb-2">
                    "Nedaxer provides exceptional trading tools and resources that have helped me improve my trading strategy."
                  </p>
                  <p className="text-xs font-medium">— Michael R., Member since 2022</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/account/login" className="text-[#0033a0] hover:text-[#ff5900] font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}